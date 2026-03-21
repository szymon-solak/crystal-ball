import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia } from "elysia";
import { createDb } from "./db/client";
import { createHealthRouter } from "./health";
import { createLoggerMiddleware } from "./logger";
import { createMovieRouter } from "./movies";
import { createUserRouter } from "./users";

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
				spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
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
