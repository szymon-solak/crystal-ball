INSERT INTO public.movie (movie_id, title, release_year) VALUES
	(1, 'The Fifth Element', 1997),
	(2, 'Blade Runner', 1982),
	(3, 'Akira', 1988),
	(4, 'The Matrix', 1999),
	(5, 'Pulp Fiction', 1994),
	(6, 'Goodfellas', 1990),
	(7, 'Trainspotting', 1996),
	(8, 'Drive', 2011)
ON CONFLICT (movie_id) DO UPDATE;

INSERT INTO public.user (user_id, name) VALUES
	(1, 'Ryan'),
	(2, 'John'),
	(3, 'Julie'),
	(4, 'Susan')
ON CONFLICT (user_id) DO UPDATE;

INSERT INTO public.movie_view (user_id, movie_id) VALUES
	(1, 1),
	(1, 2),
	(1, 4),
	(2, 3),
	(2, 4),
	(2, 7),
	(2, 8),
	(3, 1),
	(3, 2),
	(3, 5),
	(3, 6),
	(4, 1),
	(4, 2),
	(4, 3),
	(4, 4),
	(4, 5),
	(4, 8)
ON CONFLICT (user_id, movie_id) DO NOTHING;
