import axios from 'axios';

// Central axios instance with env-aware base URL
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://vacholink.onrender.com',
  timeout: 5000,
  withCredentials: true
});

export default api;

