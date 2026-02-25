import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia } from "elysia";
import { createDb } from "./db";

const db = createDb();

const movieRouter = new Elysia()
	.get("/movies", async () => {
		const movies =
			await db.query`select movie_id, title, release_year from movie;`;

		return movies;
	})
	.get("/movies/:movieId", async ({ params: { movieId }, status }) => {
		const [movie] =
			await db.query`select movie_id, title, release_year from movie where movie_id = ${movieId};`;

		if (!movie) {
			return status(404);
		}

		return movie;
	});

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
	.use(movieRouter)
	.use(userRouter)
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
