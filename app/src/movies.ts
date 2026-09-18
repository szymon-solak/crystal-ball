import { Elysia, t } from "elysia";
import type { Database } from "./db/client";
import type { Movie } from "./types";

export function createMovieRouter(db: Database) {
	return new Elysia()
		.get("/movies", async () => {
			const movies = await db.query<
				Movie[]
			>`select movie_id, title, release_year from movie;`;

			return movies;
		})
		.get("/movies/most-seen", async () => {
			const movies = await db.query<
				Movie[]
			>`select movie.movie_id, title, release_year, count(movie_view.user_id) from movie_view left join movie on movie_view.movie_id = movie.movie_id where movie_view.unseen_at is null group by movie.movie_id order by count(movie_view.user_id) desc`;

			return movies;
		})
		.get(
			"/movies/search",
			async ({ query: { q }, set }) => {
				if (!q || q.trim() === "") {
					set.status = 400;
					return { error: "Query parameter 'q' is required" };
				}

				const movies = await db.query<
					Movie[]
				>`select movie_id, title, release_year from movie where title ilike ${`%${q}%`} order by title limit 20;`;

				return movies;
			},
			{
				query: t.Object({
					q: t.Optional(t.String()),
				}),
			},
		)
		.get(
			"/movies/recommendations/:userId",
			async ({ params: { userId }, set }) => {
				const [user] = await db.query<
					Array<{ user_id: number }>
				>`select user_id from "user" where user_id = ${userId};`;

				if (!user) {
					set.status = 404;
					return { error: "User not found" };
				}

				// Simulate slow recommendation computation
				await Bun.sleep(50 + Math.floor(Math.random() * 250));

				const movies = await db.query<Movie[]>`
					select m.movie_id, m.title, m.release_year, count(mv.user_id) as score
					from movie m
					left join movie_view mv
						on m.movie_id = mv.movie_id
						and mv.user_id != ${userId}
						and mv.unseen_at is null
					where m.movie_id not in (
						select movie_id from movie_view
						where user_id = ${userId} and unseen_at is null
					)
					group by m.movie_id
					order by score desc, random()
					limit 10;
				`;

				return movies;
			},
			{
				params: t.Object({
					userId: t.Number(),
				}),
			},
		)
		.get(
			"/movies/:movieId",
			async ({ params: { movieId }, set }) => {
				const [movie] = await db.query<
					Movie[]
				>`select movie_id, title, release_year from movie where movie_id = ${movieId};`;

				if (!movie) {
					set.status = 404;
					return;
				}

				return movie;
			},
			{
				params: t.Object({
					movieId: t.Number(),
				}),
			},
		)
		.get(
			"/movies/:movieId/trailer",
			async ({ params: { movieId }, set }) => {
				const [movie] = await db.query<
					Movie[]
				>`select movie_id, title from movie where movie_id = ${movieId};`;

				if (!movie) {
					set.status = 404;
					return { error: "Movie not found" };
				}

				// Simulate external trailer service being flaky
				if (Math.random() < 0.2) {
					set.status = 503;
					return { error: "Trailer service temporarily unavailable" };
				}

				return {
					movie_id: movie.movie_id,
					title: movie.title,
					trailer_url: `https://trailers.example.com/watch/${movie.movie_id}`,
				};
			},
			{
				params: t.Object({
					movieId: t.Number(),
				}),
			},
		)
		.post(
			"/movies",
			async ({ body }) => {
				const [{ movie_id }] = await db.query<
					Array<Pick<Movie, "movie_id">>
				>`insert into movie (title, release_year) values (${body.title}, ${body.release_year}) returning movie_id`;

				return { ok: true, id: movie_id };
			},
			{
				body: t.Object({
					title: t.String({
						minLength: 3,
					}),
					release_year: t.Number({
						minimum: 1000,
					}),
				}),
			},
		);
}
