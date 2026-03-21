import type { Movie } from "../types";

export const users = [
	{ user_id: 1, name: "Peter" },
	{ user_id: 2, name: "Robert" },
	{ user_id: 3, name: "Alice" },
];

export const movies: Movie[] = [
	{
		movie_id: 1,
		title: "One Hundred and One Dalmatians",
		release_year: 1961,
	},
	{ movie_id: 2, title: "The Aristocats", release_year: 1970 },
	{ movie_id: 3, title: "Ratatouille", release_year: 2007 },
	{ movie_id: 4, title: "All dogs go to heaven", release_year: 1989 },
];

export const views = [
	{ movie_id: 2, user_id: 1 },
	{ movie_id: 3, user_id: 1 },
	{ movie_id: 4, user_id: 1 },
	{ movie_id: 2, user_id: 2 },
	{ movie_id: 3, user_id: 2 },
	{ movie_id: 2, user_id: 3 },
	{ movie_id: 4, user_id: 3 },
];
