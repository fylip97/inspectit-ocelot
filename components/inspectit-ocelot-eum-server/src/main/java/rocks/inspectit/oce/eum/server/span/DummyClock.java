package rocks.inspectit.oce.eum.server.span;

import io.opencensus.common.Clock;
import io.opencensus.common.Timestamp;

public class DummyClock extends Clock {

    private int count;
    private long duration;
    private long startTime;
    private long temp;

    public DummyClock(long duration, long startTime){
        count=0;
        this.duration = duration;
        this.startTime = startTime;
    }

    /**
     * Returns the start time of the span.
     */
    @Override
    public Timestamp now() {
        return Timestamp.fromMillis((startTime/1000));
    }

    /**
     * Returns the duration of the span.
     */
    @Override
    public long nowNanos() {
        ++count;
        if(count==1 || count==2) {
            temp = startTime;
        }
        if(count==3){
            temp = temp+(duration*1000);
        }
        System.out.println(temp);
        return temp;
    }
}
