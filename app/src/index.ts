import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia } from "elysia";
import { createDb } from "./db";

const db = createDb();

const app = new Elysia()
	.use(
		opentelemetry({
			spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
		}),
	)
	.get("/", () => "Hello Elysia")
	.get("/random", () => Math.random())
	.get("/health", async () => {
		await db.query`SELECT 1 + 2;`;

		await db.begin(async (tx) => {
			return tx`SELECT 1 + 1;`;
		});

		return { ok: true };
	})
	.listen(3007);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
