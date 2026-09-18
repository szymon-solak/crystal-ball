import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3007';

const MOVIE_IDS = [1, 2, 3, 4, 5, 6, 7, 8];
const USER_IDS = [1, 2, 3, 4];
const INVALID_USER_ID = 9999;
const SEARCH_TERMS = ['Matrix', 'Blade', 'Akira', 'Run', 'The', 'Drive'];

export const options = {
  scenarios: {
    // Slow: hits recommendations (50-300ms per call) with occasional 404s
    recommendations: {
      executor: 'constant-vus',
      vus: 4,
      duration: '45s',
      exec: 'recommendations',
    },
    // Errors: trailer endpoint has ~20% 503 rate
    trailers: {
      executor: 'constant-vus',
      vus: 6,
      duration: '45s',
      exec: 'trailers',
    },
    // Mix: search (some 400s on empty q) + unwatched
    browse: {
      executor: 'constant-vus',
      vus: 3,
      duration: '45s',
      exec: 'browse',
    },
  },
  thresholds: {
    // Recommendations are intentionally slow — allow up to 500ms p95
    'http_req_duration{scenario:recommendations}': ['p(95)<500'],
    // Trailers are expected to fail ~20% — threshold is relaxed
    'http_req_failed{scenario:trailers}': ['rate<0.35'],
  },
};

export function recommendations() {
  // 10% of calls use an invalid user ID to trigger 404
  const userId = Math.random() < 0.1
    ? INVALID_USER_ID
    : USER_IDS[Math.floor(Math.random() * USER_IDS.length)];

  const res = http.get(`${BASE_URL}/movies/recommendations/${userId}`);

  check(res, {
    'recommendations: 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(0.5);
}

export function trailers() {
  const movieId = MOVIE_IDS[Math.floor(Math.random() * MOVIE_IDS.length)];
  const res = http.get(`${BASE_URL}/movies/${movieId}/trailer`);

  check(res, {
    'trailer: 200 or 503': (r) => r.status === 200 || r.status === 503,
  });

  sleep(0.2);
}

export function browse() {
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];

  // Search — mix of valid terms and missing q (→ 400)
  const term = Math.random() < 0.15
    ? ''
    : SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  const searchUrl = term
    ? `${BASE_URL}/movies/search?q=${encodeURIComponent(term)}`
    : `${BASE_URL}/movies/search`;
  const search = http.get(searchUrl);
  check(search, { 'search: 200 or 400': (r) => r.status === 200 || r.status === 400 });

  // Unwatched list
  const unwatched = http.get(`${BASE_URL}/users/${userId}/unwatched`);
  check(unwatched, { 'unwatched: 200': (r) => r.status === 200 });

  sleep(0.3);
}
