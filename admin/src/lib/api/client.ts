import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    const payload = axios.isAxiosError(error) ? error.response?.data : undefined;
    const message = payload && typeof payload === 'object' && 'message' in payload
      ? payload.message
      : undefined;
    const readableMessage = Array.isArray(message)
      ? message.join(', ')
      : typeof message === 'string'
        ? message
        : 'Không thể kết nối đến máy chủ';

    return Promise.reject(new Error(readableMessage));
  },
);
