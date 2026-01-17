export const API_BASE_URL = "http://localhost:3000";

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };
  
  const config = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}