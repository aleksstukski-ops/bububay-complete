import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://www.bububay.de';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const register = (name: string, email: string, password: string) =>
  api.post('/api/auth/register', { name, email, password });

export const getProfile = () => api.get('/api/auth/me');

export const getHighlights = (limit = 20) =>
  api.get(`/api/highlights?limit=${limit}`);

export const generateTitle = (product_name: string, category = '') =>
  api.post('/api/ai/generate-title', { product_name, category });

export const calculateProfit = (buying_price: number, selling_price: number, shipping_cost = 0) =>
  api.post('/api/calculator/profit', { buying_price, selling_price, shipping_cost });

export const getOrders = () => api.get('/api/orders?limit=20');

export default api;
