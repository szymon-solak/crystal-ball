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
			>`select movie.movie_id, title, release_year, count(movie_view.user_id) from movie_view left join movie on movie_view.movie_id = movie.movie_id group by movie.movie_id order by count(movie_view.user_id) desc`;

			return movies;
		})
		.get(
			"/movies/:movieId",
			async ({ params: { movieId }, status }) => {
				const [movie] = await db.query<
					Movie[]
				>`select movie_id, title, release_year from movie where movie_id = ${movieId};`;

				if (!movie) {
					return status(404);
				}

				return movie;
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
