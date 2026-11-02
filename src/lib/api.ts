import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuth } from './auth';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshInFlight: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const request = error.config as RetryConfig | undefined;
    const { refreshToken } = useAuth.getState();
    if (error.response?.status !== 401 || !request || request._retry || !refreshToken) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      refreshInFlight ??= axios
        .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
        .then((response) => {
          const result = unwrap<{ accessToken: string; refreshToken: string }>(response.data);
          useAuth.getState().setTokens(result);
          return result.accessToken;
        })
        .finally(() => {
          refreshInFlight = null;
        });
      const accessToken = await refreshInFlight;
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      useAuth.getState().logout();
      if (window.location.pathname !== '/login') window.location.assign('/login');
      return Promise.reject(refreshError);
    }
  },
);

export function unwrap<T>(value: unknown): T {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data: T }).data;
  }
  return value as T;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return Array.isArray(message) ? message.join(', ') : message || error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export default api;
