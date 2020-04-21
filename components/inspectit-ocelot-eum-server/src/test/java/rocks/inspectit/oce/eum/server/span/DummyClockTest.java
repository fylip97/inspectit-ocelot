package rocks.inspectit.oce.eum.server.span;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import static org.assertj.core.api.Assertions.assertThat;

public class DummyClockTest {


@Nested
    public class nowNanos{

        private DummyClock dummyClock;


    @BeforeEach
    private void before(){
            dummyClock = new DummyClock(1000,0);
        }

     @Test
    public void firstCall(){

         assertThat(dummyClock.nowNanos()).isEqualTo(0);
     }

     @Test
    public void secondCalls(){

        dummyClock.nowNanos();
        assertThat(dummyClock.nowNanos()).isEqualTo(0);
     }


     @Test
    public void thirdCalls(){

        dummyClock.nowNanos();
        dummyClock.nowNanos();
        assertThat(dummyClock.nowNanos()).isEqualTo(1000000000);
     }
    }
}
