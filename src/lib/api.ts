import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuth } from './auth';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _skipRetry?: boolean;
}

const MAX_RETRIES = 3;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 45_000,
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

    // 1. Handle 401 token refresh
    const { refreshToken } = useAuth.getState();
    if (error.response?.status === 401 && request && !request._retry && refreshToken) {
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
    }

    // 2. Retry Job for server waking up (cold start) or transient timeouts
    if (request && !request._skipRetry) {
      const currentRetry = request._retryCount || 0;
      const isNetworkOrTimeout =
        !error.response ||
        error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        error.code === 'ETIMEDOUT';
      const isTransientServerError =
        error.response?.status === 502 ||
        error.response?.status === 503 ||
        error.response?.status === 504 ||
        error.response?.status === 408;

      const url = request.url || '';
      const method = (request.method || 'get').toLowerCase();
      // Retry auth requests, health checks, and idempotent requests
      const isAuthRequest = url.includes('/auth/');
      const isIdempotent = method === 'get' || method === 'head' || method === 'options';

      if ((isNetworkOrTimeout || isTransientServerError) && (isAuthRequest || isIdempotent) && currentRetry < MAX_RETRIES) {
        request._retryCount = currentRetry + 1;
        const delay = Math.min(1500 * Math.pow(1.8, currentRetry), 6000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(request);
      }
    }

    return Promise.reject(error);
  },
);

let wakePromise: Promise<void> | null = null;

/**
 * Preemptively pings the backend server to wake it up from cold-start sleep
 * (e.g. Render / free hosting tier).
 */
export function wakeServer(): Promise<void> {
  if (!wakePromise) {
    wakePromise = axios
      .get(`${api.defaults.baseURL}/health`, { timeout: 15_000 })
      .catch(() => axios.get(`${api.defaults.baseURL}`, { timeout: 15_000 }))
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setTimeout(() => {
          wakePromise = null;
        }, 30_000);
      });
  }
  return wakePromise;
}

export function unwrap<T>(value: unknown): T {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data: T }).data;
  }
  return value as T;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const rawMessage = error.message || '';
    const isTimeout =
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      rawMessage.toLowerCase().includes('timeout') ||
      rawMessage.includes('3000ms') ||
      rawMessage.includes('30000ms') ||
      rawMessage.includes('45000ms') ||
      error.response?.status === 504 ||
      error.response?.status === 408;

    if (isTimeout) {
      return 'System busy, please try again';
    }

    const message = error.response?.data?.message;
    if (message) {
      const formatted = Array.isArray(message) ? message.join(', ') : String(message);
      if (
        formatted.toLowerCase().includes('timeout') ||
        formatted.includes('3000ms') ||
        formatted.includes('30000ms')
      ) {
        return 'System busy, please try again';
      }
      return formatted;
    }

    if (error.response?.status === 502 || error.response?.status === 503) {
      return 'System busy, please try again';
    }

    if (!error.response && error.code === 'ERR_NETWORK') {
      return 'System busy, please try again';
    }

    return error.message;
  }

  if (error instanceof Error) {
    const msg = error.message;
    if (
      msg.toLowerCase().includes('timeout') ||
      msg.includes('3000ms') ||
      msg.includes('30000ms')
    ) {
      return 'System busy, please try again';
    }
    return msg;
  }

  return 'Something went wrong. Please try again.';
}

export default api;

