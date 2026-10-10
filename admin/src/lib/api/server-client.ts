import axios from 'axios';

/** Axios client for server-side Next route handlers talking to the API gateway. */
export const backendApiClient = axios.create({
  baseURL: process.env.BACKEND_URL ?? 'http://127.0.0.1:3000',
  timeout: 20_000,
  headers: { Accept: 'application/json' },
});
