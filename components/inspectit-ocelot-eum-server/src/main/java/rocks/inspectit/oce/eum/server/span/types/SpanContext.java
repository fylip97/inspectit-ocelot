package rocks.inspectit.oce.eum.server.span.types;

import lombok.Data;

@Data
public class SpanContext {

    private String spanId;
    private String traceId;
    private int traceFlags;
    private String traceState;
}
