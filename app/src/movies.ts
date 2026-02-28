import { Elysia } from "elysia";
import type { Database } from "./db/client";

export interface Movie {
	movie_id: number;
	title: string;
	release_year: number;
}

export function createMovieRouter(db: Database) {
	return new Elysia()
		.get("/movies", async () => {
			const movies = await db.query<
				Movie[]
			>`select movie_id, title, release_year from movie;`;

			return movies;
		})
		.get("/movies/most-seen", async () => {
			const movies = db.query<
				Movie[]
			>`select movie.movie_id, title, release_year, count(movie_view.user_id) from movie_view left join movie on movie_view.movie_id = movie.movie_id group by movie.movie_id order by count(movie_view.user_id) desc`;

			return movies;
		})
		.get("/movies/:movieId", async ({ params: { movieId }, status }) => {
			const [movie] = await db.query<
				Movie[]
			>`select movie_id, title, release_year from movie where movie_id = ${movieId};`;

			if (!movie) {
				return status(404);
			}

			return movie;
		});
}
