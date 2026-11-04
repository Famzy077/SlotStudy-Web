import { useQuery } from '@tanstack/react-query';
import api, { unwrap } from '../lib/api';

export function getPath(object: unknown, path: string, fallback: unknown = undefined): unknown {
  return (
    path.split('.').reduce<unknown>((current, key) => {
      if (!current || typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[key];
    }, object) ?? fallback
  );
}

export function list<T>(data: unknown, key?: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const source = key ? (data as Record<string, unknown>)[key] : undefined;
    if (Array.isArray(source)) return source as T[];
    for (const value of Object.values(data)) {
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

export function useApiQuery<T>(
  key: string,
  url: string,
  enabled = true,
  params?: Record<string, string>,
) {
  return useQuery<T>({
    queryKey: [key, params],
    queryFn: async () => unwrap<T>((await api.get(url, { params })).data),
    enabled,
  });
}
