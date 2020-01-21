const base_1 = require("@opentelemetry/base");
const core_1 = require("@opentelemetry/core");

export default class OcelotSpanExporter {
    /**
     * Export spans.
     * @param spans
     * @param resultCallback
     */
    export(spans, resultCallback) {
        return this._sendSpans(spans, resultCallback);
    }
    /**
     * Shutdown the exporter.
     */
    shutdown() {
        return this._sendSpans([]);
    }
    /**
     * Converts span info into more readable format.
     * @param span
     */
    _exportInfo(span) {
        return {
            traceId: span.spanContext.traceId,
            parentId: span.parentSpanId,
            name: span.name,
            id: span.spanContext.spanId,
            kind: span.kind,
            timestamp: core_1.hrTimeToMicroseconds(span.startTime),
            duration: core_1.hrTimeToMicroseconds(span.duration),
            attributes: span.attributes,
            status: span.status,
            events: span.events,
            parentSpanId: span.parentSpanId,
        };
    }
    /**
     * Sends spans to EUM Server.
     */
    _sendSpans(spans, done) {
        
        this.sendToEUM(spans);
        if (done) {
            return done(base_1.ExportResult.SUCCESS);
        }
    }

    /**
     * Send the span array to the EUM Server.
     */
    sendToEUM(spans) {
        var allSpans = [];
        for (const span of spans) {
            allSpans.push(this._exportInfo(span));
        }
        console.log("Hello World!!!!!");
        console.log(allSpans);
        var spanJSON = (JSON.stringify(allSpans))
        fetch('http://localhost:8089/receiveSpan', {
            method: 'post',
            mode: "no-cors",
            headers: { 'Content-Type': 'application/json' },
            body: spanJSON

        }).catch(function(){
            console.log("error");
        });
    }
}