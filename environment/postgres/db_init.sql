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
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON TABLES TO writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO writer;

CREATE USER grafanareader WITH PASSWORD 'password' IN ROLE reader;
CREATE USER app WITH PASSWORD 'password' IN ROLE writer;

DROP DOMAIN IF EXISTS public.year;
CREATE DOMAIN public.year AS integer
	CONSTRAINT year_check CHECK (VALUE >= 1888);

CREATE TABLE IF NOT EXISTS public.movie (
	movie_id serial primary key,
	title character varying(255) NOT NULL,
	release_year public.year,
	created_at timestamp without time zone DEFAULT now() NOT NULL,
	updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user (
	user_id serial primary key,
	name character varying(255) NOT NULL,
	created_at timestamp without time zone DEFAULT now() NOT NULL,
	updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.movie_view (
	user_id integer NOT NULL,
	movie_id integer NOT NULL,

	PRIMARY KEY (user_id, movie_id)
);

ALTER TABLE ONLY public.movie_view
    DROP CONSTRAINT IF EXISTS movie_view_user_id_fkey,
    DROP CONSTRAINT IF EXISTS movie_view_movie_id_fkey;

ALTER TABLE ONLY public.movie_view
    ADD CONSTRAINT movie_view_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    ADD CONSTRAINT movie_view_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movie(movie_id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END $$;

CREATE OR REPLACE TRIGGER updated_at BEFORE UPDATE ON public.movie FOR EACH ROW EXECUTE PROCEDURE public.updated_at();
CREATE OR REPLACE TRIGGER updated_at BEFORE UPDATE ON public.user FOR EACH ROW EXECUTE PROCEDURE public.updated_at();
