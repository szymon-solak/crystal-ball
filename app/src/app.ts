import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia } from "elysia";
import { createDb } from "./db/client";
import { createMovieRouter } from "./movies";

interface AppConfig {
	port: number
}

export async function createApp(appConfig: AppConfig) {
	const db = createDb();

	await db.seed();

	const userRouter = new Elysia().get(
		"/users/:userId/seen-movies",
		async ({ params: { userId } }) => {
			const movies =
				await db.query`select movie.movie_id, title, release_year from movie_view left join movie on movie_view.movie_id = movie.movie_id where user_id = ${userId};`;

			return movies;
		},
	);

	const app = new Elysia()
		.use(
			opentelemetry({
				spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
			}),
		)
		.get("/", () => "Hello Elysia")
		.use(createMovieRouter(db))
		.use(userRouter)
		.get("/health", async () => {
			await db.query`SELECT 1 + 2;`;

			await db.begin(async (tx) => {
				return tx`SELECT 1 + 1;`;
			});

			return { ok: true };
		})
		.listen(appConfig.port);

	return app;
}

