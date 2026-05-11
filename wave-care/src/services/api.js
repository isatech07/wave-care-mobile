import axios from 'axios';

export const BASE_URL = 'http://localhost:3002';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;

