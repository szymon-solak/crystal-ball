import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3007';

const MOVIE_IDS = [1, 2, 3, 4, 5, 6, 7, 8];
const USER_IDS = [1, 2, 3, 4];

let movieCounter = 0;

export const options = {
  scenarios: {
    browse: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 10 },
        { duration: '30s', target: 10 },
        { duration: '5s', target: 0 },
      ],
    },
    create: {
      executor: 'constant-vus',
      vus: 2,
      duration: '30s',
      startTime: '15s',
      exec: 'create',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate==0'],
  },
};

export default function () {
  const movieId = MOVIE_IDS[Math.floor(Math.random() * MOVIE_IDS.length)];
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];

  const health = http.get(`${BASE_URL}/health`);
  check(health, { 'health 200': (r) => r.status === 200 });

  const movies = http.get(`${BASE_URL}/movies`);
  check(movies, { 'movies 200': (r) => r.status === 200 });

  const mostSeen = http.get(`${BASE_URL}/movies/most-seen`);
  check(mostSeen, { 'most-seen 200': (r) => r.status === 200 });

  const movie = http.get(`${BASE_URL}/movies/${movieId}`);
  check(movie, { 'movie detail 200': (r) => r.status === 200 });

  const seenMovies = http.get(`${BASE_URL}/users/${userId}/seen-movies`);
  check(seenMovies, { 'seen-movies 200': (r) => r.status === 200 });

  const see = http.post(`${BASE_URL}/users/${userId}/see/${movieId}`);
  check(see, { 'see 200': (r) => r.status === 200 });

  const unsee = http.post(`${BASE_URL}/users/${userId}/unsee/${movieId}`);
  check(unsee, { 'unsee 200': (r) => r.status === 200 });

  sleep(1);
}

export function create() {
  movieCounter++;
  const title = `Perf Movie ${__VU}-${movieCounter}`;
  const body = JSON.stringify({ title, release_year: 2000 + (movieCounter % 25) });
  const res = http.post(`${BASE_URL}/movies`, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'create movie 200': (r) => r.status === 200 });
  sleep(1);
}
