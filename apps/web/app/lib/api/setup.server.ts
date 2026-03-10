import { setBaseUrl } from '../api-client/api.client.mjs';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';
setBaseUrl(API_BASE_URL);
