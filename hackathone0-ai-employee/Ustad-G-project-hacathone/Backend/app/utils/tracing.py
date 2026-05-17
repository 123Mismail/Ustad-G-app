from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from app.config import get_settings

def setup_tracing():
    settings = get_settings()
    
    # Check if we are in development mode to send to local Phoenix
    if settings.app_env.lower() in ["development", "dev", "local"]:
        provider = TracerProvider()
        # Phoenix local OTLP endpoint (Default for Phoenix is 6006)
        exporter = OTLPSpanExporter(endpoint="http://localhost:6006/v1/traces")
        processor = BatchSpanProcessor(exporter)
        provider.add_span_processor(processor)
        trace.set_tracer_provider(provider)
        print("OpenTelemetry tracing enabled: Sending traces to Arize Phoenix (http://localhost:6006)")
    else:
        # Placeholder for future Google Cloud Trace setup
        pass
