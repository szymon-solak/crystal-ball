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
				>`select movie.movie_id, title, release_year from movie_view left join movie on movie_view.movie_id = movie.movie_id where user_id = ${userId} and unseen_at is null order by seen_at desc;`;

				return movies;
			},
			{
				params: t.Object({
					userId: t.Number(),
				}),
			},
		)
		.get(
			"/users/:userId/unwatched",
			async ({ params: { userId }, set }) => {
				const [user] = await db.query<
					Array<{ user_id: number }>
				>`select user_id from "user" where user_id = ${userId};`;

				if (!user) {
					set.status = 404;
					return { error: "User not found" };
				}

				const movies = await db.query<
					Movie[]
				>`select m.movie_id, m.title, m.release_year from movie m where m.movie_id not in (select movie_id from movie_view where user_id = ${userId} and unseen_at is null) order by m.movie_id;`;

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
					insert into movie_view (user_id, movie_id, seen_at, unseen_at)
					values (${userId}, ${movieId}, now(), null)
					on conflict (user_id, movie_id) do update set seen_at = now(), unseen_at = null
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
					update movie_view set unseen_at = now()
					where user_id = ${userId} and movie_id = ${movieId}
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
