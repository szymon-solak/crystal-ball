import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { SQL } from "bun";
import { Elysia } from "elysia";

const db = new SQL("postgres://tracing:gnicart@postgres:5432/tracing");

const app = new Elysia()
	.use(
		opentelemetry({
			spanProcessors: [
				new BatchSpanProcessor(
					new OTLPTraceExporter({
						url: "http://tempo:4318/v1/traces",
					}),
				),
			],
		}),
	)
	.get("/", () => "Hello Elysia")
	.get("/random", () => Math.random())
	.get("/health", async () => {
		try {
			const res = await db`SELECT 1 + 1;`;
			console.log(res);
		} catch (error) {
			console.log(error)
		}


		return { ok: true };
	})
	.listen(3007);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
