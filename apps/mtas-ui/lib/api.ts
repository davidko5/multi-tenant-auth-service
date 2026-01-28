import axios, { AxiosError } from 'axios';
import {
  UserLoginRequest,
  UserRegisterRequest,
  ClientLoginRequest,
  ClientRegisterRequest,
  ClientUpdateRequest,
} from '@/types/auth';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.response.use(
  res => res,                       // pass through successful responses
  (err: AxiosError) => {
    const status = err.response?.status;

    // if we’re running in the browser *and* the backend says “unauthorized”
    if (typeof window !== 'undefined' && status === 401) {

      // Router.replace('/');
      window.location.href = '/';
    }

    return Promise.reject(err);     // let React-Query still see the error
  }
);

// User API endpoints
export const userApi = {
  login: (credentials: UserLoginRequest) =>
    api.post('/user-auth/login', credentials),

  register: (userData: UserRegisterRequest) =>
    api.post('/user-auth/register', userData),

  getAuthenticatedUser: () => api.get('/user-auth/authenticated-user'),

  logout: () => api.post('/user-auth/logout'),
};

// Client API endpoints
export const clientApi = {
  login: (credentials: ClientLoginRequest) =>
    api.post('/client-auth/login', credentials),

  register: (clientData: ClientRegisterRequest) =>
    api.post('/client-auth/register', clientData),

  getAuthenticatedClient: () => api.get('/client-auth/authenticated-client'),

  updateProfile: (clientId: string, data: ClientUpdateRequest) =>
    api.patch(`/clients/${clientId}`, data),

  clientLogout: () => api.post('/client-auth/logout'),
};

export default api;
