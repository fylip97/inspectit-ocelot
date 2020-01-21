import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracer } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
//import { ZoneScopeManager } from '@opentelemetry/scope-zone';



export function testWebtracer() {
    // Minimum required setup - supports only synchronous operations
    const webTracer = new WebTracer({
        plugins: [
            new DocumentLoad()
        ]
    });

    webTracer.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}