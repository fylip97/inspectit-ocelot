package rocks.inspectit.oce.eum.server.exporters;

import com.google.gson.Gson;
import io.opencensus.implcore.trace.RecordEventsSpanImpl;
import io.opencensus.trace.AttributeValue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import rocks.inspectit.oce.eum.server.span.types.Span;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;

public class JaegerExporterServiceTest {

    private JaegerExporterService jaegerExporterService = new JaegerExporterService();

   @Nested
    public class ConvertSpans{

       private String myJson="[{\"traceId\":\"ca5aafe0dffb4078306a5da789bc674d\"," +
               "\"name\":\"foo\"," +
               "\"id\":\"3212eda21fc9b335\"," +
               "\"kind\":0," +
               "\"timestamp\":1574427348836648," +
               "\"duration\":35," +
               "\"attributes\":{\"aaa\":\"test7\"}," +
               "\"status\":{\"code\":0}," +
               "\"events\":[]}]";

       private ArrayList<RecordEventsSpanImpl> convertedSpans;

       @BeforeEach
       public void before(){
           Span[] spans;
           Gson gson = new Gson();
           spans = gson.fromJson(myJson,Span[].class);
           convertedSpans= jaegerExporterService.convertSpans(spans);
       }

       @Test
       public void checkName(){
           assertThat(convertedSpans.get(0).getName()).isEqualTo("foo");
       }

       @Test
       public void checkChildSpanCount(){
           assertThat(convertedSpans.get(0).toSpanData().getChildSpanCount()).isEqualTo(0);
       }

       @Test
       public void checkSpanId(){
           assertThat(convertedSpans.get(0).toSpanData().getContext().getSpanId().toLowerBase16()).isEqualTo("3212eda21fc9b335");
       }

       @Test
       public void checkTraceId(){
           assertThat(convertedSpans.get(0).toSpanData().getContext().getTraceId().toLowerBase16()).isEqualTo("ca5aafe0dffb4078306a5da789bc674d");
       }

       @Test
       public void checkStatusCanonicalCode(){
           assertThat(convertedSpans.get(0).getStatus().getCanonicalCode().toString()).isEqualTo("OK");
       }

       @Test
       public void  checkStatusDescription(){
           assertThat(convertedSpans.get(0).getStatus().getDescription()).isNull();
       }

       @Test
       public void checkAttributeSize(){
           assertThat(convertedSpans.get(0).toSpanData().getAttributes().getAttributeMap().size()).isEqualTo(1);
       }

       @Test
       public void checkAttributeValue(){
           assertThat(convertedSpans.get(0).toSpanData().getAttributes().getAttributeMap().containsValue(AttributeValue.stringAttributeValue("test7"))).isTrue();
       }

       @Test
       public void checkAttributeKey(){
           assertThat(convertedSpans.get(0).toSpanData().getAttributes().getAttributeMap().containsKey("aaa")).isTrue();
       }

       @Test
       public void checkStartTimestampSeconds(){
           assertThat(convertedSpans.get(0).toSpanData().getStartTimestamp().getSeconds()).isEqualTo(1574427348);
       }

       @Test
       public void checkStartTimestampNanos(){
           assertThat(convertedSpans.get(0).toSpanData().getStartTimestamp().getNanos()).isEqualTo(836000000);
       }

       @Test
       public void checkKind(){
           assertThat(convertedSpans.get(0).toSpanData().getKind()).isNull();
       }
    }

}
