export const API_BASE = '';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMsg = errorData.error;
      }
    } catch (_e) {
      // Ignore parse error
    }
    throw new Error(errorMsg);
  }

  const json = await response.json();

  if (json && typeof json === 'object' && 'success' in json) {
    if (json.success === false) {
      throw new Error(json.error ?? 'Unknown API error');
    }
    return json.data as T;
  }

  return json as T;
}
