package rocks.inspectit.oce.eum.server.span;

import io.opencensus.implcore.trace.RecordEventsSpanImpl;

public class DummyStartHandler implements RecordEventsSpanImpl.StartEndHandler {
    @Override
    public void onStart(RecordEventsSpanImpl span) {

    }

    @Override
    public void onEnd(RecordEventsSpanImpl span) {

    }
}
