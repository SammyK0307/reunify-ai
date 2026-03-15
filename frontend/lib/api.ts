import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = Cookies.get('reunify_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('reunify_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const login = async (email: string, password: string) => {
  const res = await api.post('/api/auth/login', { email, password });
  Cookies.set('reunify_token', res.data.access_token, { expires: 0.5 });
  return res.data;
};

export const uploadAndSearch = async (file: File) => {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const registerChild = async (formData: FormData) => {
  const res = await api.post('/api/register-child', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getChildren = async () => {
  const res = await api.get('/api/children');
  return res.data;
};

export const updateChildStatus = async (childId: string, status: string) => {
  const res = await api.patch(`/api/children/${childId}/status?status=${status}`);
  return res.data;
};

export const healthCheck = async () => {
  const res = await api.get('/health');
  return res.data;
};
