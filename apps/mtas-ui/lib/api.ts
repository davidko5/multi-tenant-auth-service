import axios, { AxiosError } from 'axios';
import UserLoginRequestDto from '../../mtas-api/src/auth/dto/user-login-request.dto';
import UserRegisterRequestDto from '../../mtas-api/src/auth/dto/user-register-request.dto';
import ClientLoginRequestDto from '../../mtas-api/src/auth/dto/client-login-request.dto';
import ClientRegisterRequestDto from '../../mtas-api/src/auth/dto/client-register-request.dto';
import ClientUpdateRequestDto from '../../mtas-api/src/auth/dto/client-update-request.dto';
import Router from 'next/router';

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
  login: (credentials: UserLoginRequestDto) =>
    api.post('/user-auth/login', credentials),

  register: (userData: UserRegisterRequestDto) =>
    api.post('/user-auth/register', userData),

  getAuthenticatedUser: () => api.get('/user-auth/authenticated-user'),

  logout: () => api.post('/user-auth/logout'),
};

// Client API endpoints
export const clientApi = {
  login: (credentials: ClientLoginRequestDto) =>
    api.post('/client-auth/login', credentials),

  register: (clientData: ClientRegisterRequestDto) =>
    api.post('/client-auth/register', clientData),

  getAuthenticatedClient: () => api.get('/client-auth/authenticated-client'),

  updateProfile: (clientId: string, data: ClientUpdateRequestDto) =>
    api.patch(`/clients/${clientId}`, data),

  clientLogout: () => api.post('/client-auth/logout'),
};

export default api;
