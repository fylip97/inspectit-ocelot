package rocks.inspectit.oce.eum.server.span.types;
import lombok.Data;

import java.util.HashMap;

@Data
public class Span {

    private String traceId;
    private String name;
    private String id;
    private int kind;
    private long timestamp;
    private long duration;
    private HashMap<String,String> attributes;
    private HashMap<String,Integer> status;
    private String[] events;
    private String parentSpanId;

}
