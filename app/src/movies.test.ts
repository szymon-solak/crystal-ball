import { beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { createDb } from "./db/client";
import { createMovieRouter, type Movie } from "./movies";

describe("Movies", () => {
	const db = createDb();
	const api = treaty(createMovieRouter(db));

	const users = [
		{ user_id: 1, name: "Peter" },
		{ user_id: 2, name: "Robert" },
		{ user_id: 3, name: "Alice" },
	];

	const movies: Movie[] = [
		{
			movie_id: 1,
			title: "One Hundred and One Dalmatians",
			release_year: 1961,
		},
		{ movie_id: 2, title: "The Aristocats", release_year: 1970 },
		{ movie_id: 3, title: "Ratatouille", release_year: 2007 },
		{ movie_id: 4, title: "All dogs go to heaven", release_year: 1989 },
	];

	const views = [
		{ movie_id: 2, user_id: 1 },
		{ movie_id: 3, user_id: 1 },
		{ movie_id: 4, user_id: 1 },
		{ movie_id: 2, user_id: 2 },
		{ movie_id: 3, user_id: 2 },
		{ movie_id: 2, user_id: 3 },
		{ movie_id: 4, user_id: 3 },
	];

	beforeAll(async () => {
		await db.begin(async (tx) => {
			await tx`DELETE FROM public.movie_view`;
			await tx`DELETE FROM public.movie`;
			await tx`DELETE FROM public.user`;

			await tx`INSERT INTO public.movie ${db.wrap(movies)}`;
			await tx`INSERT INTO public.user ${db.wrap(users)}`;
			await tx`INSERT INTO public.movie_view ${db.wrap(views)}`;
		});
	});

	it("should get all movies", async () => {
		const { data, error, response } = await api.movies.get();

		expect(data?.length).toBe(movies.length);
		expect(error).toBeNull();
		expect(response.status).toBe(200);
	});

	it("should get movie by id", async () => {
		const { data, error, response } = await api
			.movies({ movieId: movies[0].movie_id })
			.get();

		expect(data).toEqual(expect.objectContaining(movies[0]));
		expect(error).toBeNull();
		expect(response.status).toBe(200);
	});

	it("should get most seen movies", async () => {
		const { data, error, response } = await api.movies["most-seen"].get();

		expect(data?.[0]).toEqual(expect.objectContaining(movies[1]));
		expect(error).toBeNull();
		expect(response.status).toBe(200);
	});
});
