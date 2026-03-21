import { Elysia, t } from "elysia";
import type { Database } from "./db/client";
import type { Movie } from "./types";

export function createUserRouter(db: Database) {
	return new Elysia()
		.get(
			"/users/:userId/seen-movies",
			async ({ params: { userId } }) => {
				const movies = await db.query<
					Movie[]
				>`select movie.movie_id, title, release_year from movie_view left join movie on movie_view.movie_id = movie.movie_id where user_id = ${userId};`;

				return movies;
			},
			{
				params: t.Object({
					userId: t.Number(),
				}),
			},
		)
		.post(
			"/users/:userId/see/:movieId",
			async ({ params: { userId, movieId } }) => {
				await db.query`
					insert into movie_view (user_id, movie_id) values (${userId}, ${movieId}) on conflict do nothing
			`;

				return { ok: true };
			},
			{
				params: t.Object({
					userId: t.Number(),
					movieId: t.Number(),
				}),
			},
		)
		.post(
			"/users/:userId/unsee/:movieId",
			async ({ params: { userId, movieId } }) => {
				await db.query`
					delete from movie_view where user_id = ${userId} and movie_id = ${movieId}
			`;

				return { ok: true };
			},
			{
				params: t.Object({
					userId: t.Number(),
					movieId: t.Number(),
				}),
			},
		);
}
