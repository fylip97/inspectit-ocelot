package rocks.inspectit.oce.eum.server.service;

import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import rocks.inspectit.oce.eum.server.exporters.JaegerExporterService;
import rocks.inspectit.oce.eum.server.span.types.Span;

@RestController
public class SpanController {

    @Autowired
    JaegerExporterService jaegerExporterService;

    @RequestMapping(method = RequestMethod.POST, value="/receiveSpan")
    public void receiveSpans(@RequestBody String receiveSpan){

       Gson gson = new Gson();
       Span[] spans = gson.fromJson(receiveSpan, Span[].class);
       jaegerExporterService.exportSpan(jaegerExporterService.convertSpans(spans));

       System.out.println(receiveSpan);
    }
}
