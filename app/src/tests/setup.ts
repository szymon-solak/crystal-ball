import { beforeAll } from "bun:test";
import { createDb } from "../db/client";
import { movies, users, views } from "./data";

beforeAll(async () => {
	const db = createDb();

	await db.begin(async (tx) => {
		await tx`DELETE FROM public.movie_view`;
		await tx`DELETE FROM public.movie`;
		await tx`DELETE FROM public.user`;

		await tx`INSERT INTO public.movie ${db.wrap(movies)}`;
		await tx`INSERT INTO public.user ${db.wrap(users)}`;
		await tx`INSERT INTO public.movie_view ${db.wrap(views)}`;

		await tx`
			SELECT pg_catalog.setval(pg_get_serial_sequence('public.movie', 'movie_id'), MAX(movie_id)) FROM public.movie;
		`;
		await tx`
			SELECT pg_catalog.setval(pg_get_serial_sequence('public.user', 'user_id'), MAX(user_id)) FROM public.user;
		`;
	});
});
