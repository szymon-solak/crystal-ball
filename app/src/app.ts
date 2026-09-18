import { opentelemetry } from "@elysiajs/opentelemetry";
import type { Context, TimeInput } from "@opentelemetry/api";
import { SpanStatusCode } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import type {
	ReadableSpan,
	Span,
	SpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia } from "elysia";
import { createDb } from "./db/client";
import { createHealthRouter } from "./health";
import { createLoggerMiddleware } from "./logger";
import { createMovieRouter } from "./movies";
import { createUserRouter } from "./users";

class HttpErrorStatusProcessor implements SpanProcessor {
	onStart(span: Span, _parentContext: Context): void {
		const _end = span.end.bind(span);
		span.end = (endTime?: TimeInput) => {
			const statusCode = span.attributes["http.response.status_code"];
			if (typeof statusCode === "number" && statusCode >= 500) {
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: `HTTP ${statusCode}`,
				});
			}
			_end(endTime);
		};
	}
	onEnd(_span: ReadableSpan): void {}
	shutdown(): Promise<void> {
		return Promise.resolve();
	}
	forceFlush(): Promise<void> {
		return Promise.resolve();
	}
}

interface AppConfig {
	serviceName: string;
	port: number;
}

export async function createApp(appConfig: AppConfig) {
	const db = createDb();

	await db.seed();

	const app = new Elysia()
		.use(
			createLoggerMiddleware({
				level: "debug",
				pretty: process.env.NODE_ENV !== "production",
				serviceName: appConfig.serviceName,
			}),
		)
		.use(
			opentelemetry({
				spanProcessors: [
					new HttpErrorStatusProcessor(),
					new BatchSpanProcessor(new OTLPTraceExporter()),
				],
				serviceName: appConfig.serviceName,
			}),
		)
		.get("/", () => "Hello Elysia")
		.use(createMovieRouter(db))
		.use(createUserRouter(db))
		.use(createHealthRouter(db))
		.listen(appConfig.port);

	return app;
}
