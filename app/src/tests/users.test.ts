import { describe, expect, it } from "bun:test";
import assert from "node:assert";
import { treaty } from "@elysiajs/eden";
import { createUserRouter } from "../users";
import { testApi } from "./api";
import { movies, users, views } from "./data";

describe("Users", () => {
	const user = users[1];
	assert(user);

	const userViews = views
		.filter((v) => v.user_id === user.user_id)
		.map((uv) => uv.movie_id);
	assert(userViews.length);

	const unseenMovies = movies.filter((m) => !userViews.includes(m.movie_id));
	assert(unseenMovies.length);

	const unseenMovieId = unseenMovies[0].movie_id;
	assert(unseenMovieId);

	const seenMovieId = userViews[0];
	assert(seenMovieId);

	describe("GET /users/:userId/seen-movies", () => {
		it(
			"should get all seen movies",
			testApi(async (db) => {
				const api = treaty(createUserRouter(db));
				const { data, error, response } = await api
					.users({ userId: user.user_id })
					["seen-movies"].get();

				expect(data?.length).toBe(userViews.length);
				expect(error).toBeNull();
				expect(response.status).toBe(200);
			}),
		);
	});

	describe("POST /users/:userId/see/:movieId", () => {
		it(
			"should mark movie as seen",
			testApi(async (db) => {
				const api = treaty(createUserRouter(db));
				const seeResponse = await api
					.users({ userId: user.user_id })
					.see({
						movieId: unseenMovieId,
					})
					.post();

				expect(seeResponse.data?.ok).toBe(true);
				expect(seeResponse.error).toBeNull();
				expect(seeResponse.response.status).toBe(200);

				const seenMoviesResponse = await api
					.users({ userId: user.user_id })
					["seen-movies"].get();

				expect(
					seenMoviesResponse.data
						?.map((m) => m.movie_id)
						.includes(unseenMovieId),
				).toBe(true);
			}),
		);

		it(
			"should ignore if already marked as seen",
			testApi(async (db) => {
				const api = treaty(createUserRouter(db));
				await api
					.users({ userId: user.user_id })
					.see({
						movieId: unseenMovies[0].movie_id,
					})
					.post();

				const seeResponse = await api
					.users({ userId: user.user_id })
					.see({
						movieId: unseenMovies[0].movie_id,
					})
					.post();

				expect(seeResponse.data?.ok).toBe(true);
				expect(seeResponse.error).toBeNull();
				expect(seeResponse.response.status).toBe(200);

				const seenMoviesResponse = await api
					.users({ userId: user.user_id })
					["seen-movies"].get();

				expect(
					seenMoviesResponse.data
						?.map((m) => m.movie_id)
						.includes(unseenMovieId),
				).toBe(true);
			}),
		);
	});

	describe("POST /users/:userId/unsee/:movieId", () => {
		it(
			"should mark movie as unseen",
			testApi(async (db) => {
				const api = treaty(createUserRouter(db));
				const unseeResponse = await api
					.users({ userId: user.user_id })
					.unsee({
						movieId: seenMovieId,
					})
					.post();

				expect(unseeResponse.data?.ok).toBe(true);
				expect(unseeResponse.error).toBeNull();
				expect(unseeResponse.response.status).toBe(200);

				const seenMoviesResponse = await api
					.users({ userId: user.user_id })
					["seen-movies"].get();

				expect(
					seenMoviesResponse.data?.map((m) => m.movie_id).includes(seenMovieId),
				).toBe(false);
			}),
		);

		it(
			"should ignore if movie already marked as unseen",
			testApi(async (db) => {
				const api = treaty(createUserRouter(db));
				await api
					.users({ userId: user.user_id })
					.unsee({
						movieId: seenMovieId,
					})
					.post();

				const unseeResponse = await api
					.users({ userId: user.user_id })
					.unsee({
						movieId: seenMovieId,
					})
					.post();

				expect(unseeResponse.data?.ok).toBe(true);
				expect(unseeResponse.error).toBeNull();
				expect(unseeResponse.response.status).toBe(200);

				const seenMoviesResponse = await api
					.users({ userId: user.user_id })
					["seen-movies"].get();

				expect(
					seenMoviesResponse.data?.map((m) => m.movie_id).includes(seenMovieId),
				).toBe(false);
			}),
		);
	});
});
