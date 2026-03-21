import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { createMovieRouter } from "../movies";
import { testApi } from "./api";
import { movies } from "./data";

describe("Movies", async () => {
	describe("GET /movies", () => {
		it(
			"should get all movies",
			testApi(async (db) => {
				const api = treaty(createMovieRouter(db));
				const { data, error, response } = await api.movies.get();

				expect(data?.length).toBe(movies.length);
				expect(error).toBeNull();
				expect(response.status).toBe(200);
			}),
		);
	});

	describe("GET /movies/:movieId", () => {
		it(
			"should get movie by id",
			testApi(async (db) => {
				const api = treaty(createMovieRouter(db));
				const { data, error, response } = await api
					.movies({ movieId: movies[0].movie_id })
					.get();

				expect(data).toEqual(expect.objectContaining(movies[0]));
				expect(error).toBeNull();
				expect(response.status).toBe(200);
			}),
		);
	});

	describe("GET /movies/most-seen", () => {
		it(
			"should get most seen movies",
			testApi(async (db) => {
				const api = treaty(createMovieRouter(db));
				const { data, error, response } = await api.movies["most-seen"].get();

				expect(data?.[0]).toEqual(expect.objectContaining(movies[1]));
				expect(error).toBeNull();
				expect(response.status).toBe(200);
			}),
		);
	});

	describe("POST /movies", () => {
		it(
			"should add new movie",
			testApi(async (db) => {
				const api = treaty(createMovieRouter(db));
				const { data, error, response } = await api.movies.post({
					title: "Test",
					release_year: 2026,
				});

				expect(data?.ok).toBe(true);
				expect(error).toBeNull();
				expect(response.status).toBe(200);
			}),
		);

		it(
			"should validate title length",
			testApi(async (db) => {
				const api = treaty(createMovieRouter(db));
				const { data, error, response } = await api.movies.post({
					title: "T",
					release_year: 2026,
				});

				expect(data?.ok).not.toBe(true);
				expect(error).not.toBeNull();
				expect(response.status).toBe(422);
			}),
		);

		it(
			"should validate release year",
			testApi(async (db) => {
				const api = treaty(createMovieRouter(db));
				const { data, error, response } = await api.movies.post({
					title: "Test",
					release_year: 102,
				});

				expect(data?.ok).not.toBe(true);
				expect(error).not.toBeNull();
				expect(response.status).toBe(422);
			}),
		);
	});
});
