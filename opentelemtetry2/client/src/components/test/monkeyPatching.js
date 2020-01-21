import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import OcelotSpanExporter from './ocelotExporter';
import axios from 'axios';

const opentelemetry = require('@opentelemetry/core');
const { BasicTracer } = require('@opentelemetry/tracing');
const options = {
    serviceName: 'my-service',
    tags: [],
    host: 'localhost',
    port: 6832,
    maxPacketSize: 65000
}
const tracer = new BasicTracer();
const exporter = new OcelotSpanExporter(options);
tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));


/**
 * Override the axios get method. A span is started and terminated after the request.
 */
export function monkeyTest() {

    opentelemetry.initGlobalTracer(tracer);
    let originalAxios = axios.get;
    axios.get = (function (originalAxios) {
        return function (url) {
            var res;
            const span = opentelemetry.getTracer().startSpan("GET " + url);
            var traceId = span.spanContext.traceId;
            var spanId = span.spanContext.spanId;
            var config = {
                headers: {
                    'X-B3-TraceId': traceId,
                    'X-B3-SpanId': spanId
                }
            }
            tracer.withSpan(span, () => {
                res = originalAxios(url, config).then((response) => {
                    span.end();
                    return response;
                }).catch((error) => {
                    span.end();
                    return error;
                });
            });
            return res;
        }
    })(originalAxios)
}

/**
 * Override the axios post method. A span is started and terminated after the request.
 */
export function monkeyTest2() {

    opentelemetry.initGlobalTracer(tracer);
    let originalAxios = axios.post;
    axios.post = (function (originalAxios) {
        var res;
        return function (url, data) {
            const span = opentelemetry.getTracer().startSpan("POST " + url);
            tracer.withSpan(span, () => {
                res = originalAxios(url, data).then((response) => {
                    span.end();
                    return response;
                });
            });
            return res;
        }
    })(originalAxios)
}


export function monkeyTest3() {

    (function (xhr) {

        // Capture request before any network activity occurs:
        var send = xhr.send;
        var open = xhr.open;
        opentelemetry.initGlobalTracer(tracer);
        var span;
        var traceId;
        var spanId;

        xhr.open = function (data) {
            span = opentelemetry.getTracer().startSpan(arguments[0] + " " + arguments[1]);
            traceId = span.spanContext.traceId;
            spanId = span.spanContext.spanId;
            return open.apply(this, arguments);
        }

        var o = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            var res = o.apply(this, arguments);
            this.setRequestHeader('X-B3-TraceId', traceId);
            this.setRequestHeader('X-B3-SpanId', spanId);
            return res;
        }

        xhr.send = function (data) {
            var rsc = this.onreadystatechange;
            if (rsc) {
                // "onreadystatechange" exists. Monkey-patch it
                this.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        span.end();
                    }
                    return rsc.apply(this, arguments);
                };
            };
            return send.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype);

}




export function monkeyTest4() {

    opentelemetry.initGlobalTracer(tracer);
    const originalFetch = window.fetch;
    window.fetch = function (url, data) {
        if (url !== 'http://localhost:8089/receiveSpan') {
            var span = opentelemetry.getTracer().startSpan(arguments[0]);
            var traceId = span.spanContext.traceId;
            var spanId = span.spanContext.spanId;
            return new Promise((resolve, reject) => {
                originalFetch.apply(this, arguments)
                    .then((response) => {
                        span.end();
                    })
            });
        } else {
            return new Promise((resolve, reject) => {
                originalFetch.apply(this, arguments);
            })
        }
    }

}


