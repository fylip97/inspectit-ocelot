package rocks.inspectit.oce.eum.server.exporters;

import io.opencensus.exporter.trace.jaeger.JaegerExporterConfiguration;
import io.opencensus.implcore.trace.RecordEventsSpanImpl;
import io.opencensus.implcore.trace.export.SpanExporterImpl;
import io.opencensus.trace.*;
import io.opencensus.trace.config.TraceParams;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rocks.inspectit.oce.eum.server.configuration.model.EumServerConfiguration;
import rocks.inspectit.oce.eum.server.span.DummyClock;
import rocks.inspectit.oce.eum.server.span.DummyStartHandler;
import rocks.inspectit.oce.eum.server.span.types.Span;

import io.opencensus.exporter.trace.jaeger.JaegerTraceExporter;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * Service for the Jaeger OpenCensus exporters.
 * Is enabled, if exporters.tracing.jaeger.enabled is set to "true".
 */
@Service
@Slf4j
public class JaegerExporterService {

    @Autowired
    EumServerConfiguration configuration;

    /**
     * Triggered, if exporters.tracing.jaeger.enabled is set to "true".
     */
    @PostConstruct
    public void doEnable(){
        val config = configuration.getExporters().getTracing().getJaeger();
        if(config.isEnabled() && config.getUrl()!=null && config.getServiceName() != null){
            try{
                String serviceName = config.getServiceName();
                String thriftEndpoint = config.getUrl();
                log.info("Starting Jaeger Exporter on {}:{}", serviceName, thriftEndpoint);
                JaegerTraceExporter.createAndRegister(JaegerExporterConfiguration.builder().setThriftEndpoint(thriftEndpoint).setServiceName(serviceName).build());
            }catch (Exception e){
                log.error("Error starting Jaeger Exporter");
            }
        }
    }

    /**
     * Spans form ocelotExporter will be converted to opencensus format.
     */
    public ArrayList<RecordEventsSpanImpl> convertSpans(Span[] spans){

        ArrayList<RecordEventsSpanImpl> convertedSpans = new ArrayList<>();

        for(int i=0; i<spans.length; i++){

            Span actualSpan =spans[i];
            SpanContext spanContext = SpanContext.create(TraceId.fromLowerBase16(actualSpan.getTraceId()),SpanId.fromLowerBase16(actualSpan.getId()), TraceOptions.DEFAULT, null);
            DummyStartHandler dummyStartHandler = new DummyStartHandler();
            DummyClock dummyClock = new DummyClock(actualSpan.getDuration(),actualSpan.getTimestamp());
            RecordEventsSpanImpl span;
            if(actualSpan.getParentSpanId()!= null){
                span = RecordEventsSpanImpl.startSpan(spanContext, actualSpan.getName(), null, SpanId.fromLowerBase16(actualSpan.getParentSpanId()), null, TraceParams.DEFAULT, dummyStartHandler, null, dummyClock);
            }else{
                span = RecordEventsSpanImpl.startSpan(spanContext, actualSpan.getName(), null, null, null, TraceParams.DEFAULT, dummyStartHandler, null, dummyClock);
            }
            if(!actualSpan.getAttributes().isEmpty()){
                HashMap<String, AttributeValue> map = new HashMap<>();
                actualSpan.getAttributes().forEach((k, v) -> {
                    map.put(k,AttributeValue.stringAttributeValue(v));
                });
                span.putAttributes(map);
            }
            span.end();
            convertedSpans.add(span);
        }
        return convertedSpans;
    }

    /**
     * Spans are added to spanExporter.
     */
    public void exportSpan(ArrayList<RecordEventsSpanImpl> convertedSpans){
        SpanExporterImpl spanExporter = (SpanExporterImpl)Tracing.getExportComponent().getSpanExporter();

        for(int i=0; i<convertedSpans.size(); i++){
            spanExporter.addSpan(convertedSpans.get(i));
        }
    }

}
