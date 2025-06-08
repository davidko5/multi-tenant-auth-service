import axios from 'axios';
import UserLoginRequestDto from '../../mtas-api/src/auth/dto/user-login-request.dto';
import UserRegisterRequestDto from '../../mtas-api/src/auth/dto/user-register-request.dto';
import ClientLoginRequestDto from '../../mtas-api/src/auth/dto/client-login-request.dto';
import ClientRegisterRequestDto from '../../mtas-api/src/auth/dto/client-register-request.dto';
import ClientUpdateRequestDto from '../../mtas-api/src/auth/dto/client-update-request.dto';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// User API endpoints
export const userApi = {
  login: (credentials: UserLoginRequestDto) =>
    api.post('/auth-user/login', credentials),

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
