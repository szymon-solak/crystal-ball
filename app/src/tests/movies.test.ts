import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { createDb } from "../db/client";
import { createMovieRouter } from "../movies";
import { movies } from "./data";

describe("Movies", () => {
	const db = createDb();
	const api = treaty(createMovieRouter(db));

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
