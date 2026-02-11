import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia } from "elysia";

const app = new Elysia()
	.use(opentelemetry({
		spanProcessors: [
			new BatchSpanProcessor(
				new OTLPTraceExporter({
					url: 'http://localhost:4318/v1/traces'
				})
			)
		]
	}))
	.get("/", () => "Hello Elysia")
	.get("/random", () => Math.random())
	.listen(3007);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
