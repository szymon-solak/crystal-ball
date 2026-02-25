CREATE EXTENSION "pg_tracing";
CREATE EXTENSION "pg_stat_statements";
CREATE EXTENSION "pgrowlocks";

CREATE ROLE reader;
CREATE ROLE writer;

GRANT USAGE ON SCHEMA public TO reader;
GRANT USAGE ON SCHEMA public TO writer;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reader;

GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON ALL TABLES IN SCHEMA public TO writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON TABLES TO writer;

CREATE USER grafanareader WITH PASSWORD 'password' IN ROLE reader;
CREATE USER app WITH PASSWORD 'password' IN ROLE writer;

CREATE DOMAIN public.year AS integer
	CONSTRAINT year_check CHECK (VALUE >= 1888);

CREATE SEQUENCE public.movie_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE public.movie (
	movie_id integer DEFAULT nextval('public.movie_id_seq'::regclass) NOT NULL,
	title character varying(255) NOT NULL,
	release_year public.year,
	created_at timestamp without time zone DEFAULT now() NOT NULL,
	updated_at timestamp without time zone DEFAULT now() NOT NULL,

	PRIMARY KEY(movie_id)
);

CREATE SEQUENCE public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE public.user (
	user_id integer DEFAULT nextval('public.user_id_seq'::regclass) NOT NULL,
	name character varying(255) NOT NULL,
	created_at timestamp without time zone DEFAULT now() NOT NULL,
	updated_at timestamp without time zone DEFAULT now() NOT NULL,

	PRIMARY KEY(user_id)
);

CREATE TABLE public.movie_view (
	user_id integer NOT NULL,
	movie_id integer NOT NULL
);

ALTER TABLE ONLY public.movie_view
    ADD CONSTRAINT movie_view_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT movie_view_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movie(movie_id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE FUNCTION public.updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END $$;

CREATE TRIGGER updated_at BEFORE UPDATE ON public.movie FOR EACH ROW EXECUTE PROCEDURE public.updated_at();
CREATE TRIGGER updated_at BEFORE UPDATE ON public.user FOR EACH ROW EXECUTE PROCEDURE public.updated_at();

INSERT INTO public.movie (movie_id, title, release_year) VALUES
	(1, 'The Fifth Element', 1997),
	(2, 'Blade Runner', 1982),
	(3, 'Akira', 1988),
	(4, 'The Matrix', 1999),
	(5, 'Pulp Fiction', 1994),
	(6, 'Goodfellas', 1990),
	(7, 'Trainspotting', 1996),
	(8, 'Drive', 2011);

INSERT INTO public.user (user_id, name) VALUES
	(1, 'Ryan'),
	(2, 'John'),
	(3, 'Julie'),
	(4, 'Susan');

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
	(4, 8);
