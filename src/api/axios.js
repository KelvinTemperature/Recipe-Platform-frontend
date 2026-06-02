import axios from 'axios';

const API = axios.create({
  baseURL: 'http://51.20.78.36/api',
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh token on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(
            'https://recipe-platform-production-f8c7.up.railway.app/api/auth/refresh/',
            { refresh }
          );
          localStorage.setItem('access_token', res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return API(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;