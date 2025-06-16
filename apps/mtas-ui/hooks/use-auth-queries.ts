'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { clientApi, userApi } from '@/lib/api';
import { toast } from 'sonner';
import UserLoginRequestDto from '../../mtas-api/src/auth/dto/user-login-request.dto';
import UserRegisterRequestDto from '../../mtas-api/src/auth/dto/user-register-request.dto';
import ClientLoginRequestDto from '../../mtas-api/src/auth/dto/client-login-request.dto';
import ClientRegisterRequestDto from '../../mtas-api/src/auth/dto/client-register-request.dto';
import ClientUpdateRequestDto from '../../mtas-api/src/auth/dto/client-update-request.dto';
import { useRouter } from 'next/navigation';

// User authentication hooks
export function useUserLogin() {
  return useMutation({
    mutationFn: (credentials: UserLoginRequestDto) =>
      userApi.login(credentials),
    onError: () => {
      toast.error('An error occurred during login');
    },
  });
}

export function useUserRegister() {
  return useMutation({
    mutationFn: (userData: UserRegisterRequestDto) =>
      userApi.register(userData),
    onError: () => {
      toast.error('An error occurred during registration');
    },
  });
}

// Client authentication hooks
export function useClientLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: ClientLoginRequestDto) =>
      clientApi.login(credentials),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['clientProfile'] });
      
      toast.success('Logged in successfully');
    },
    onError: () => {
      toast.error('An error occurred during login');
    },
  });
}

export function useClientRegister() {
  return useMutation({
    mutationFn: (clientData: ClientRegisterRequestDto) =>
      clientApi.register(clientData),
    onError: () => {
      toast.error('An error occurred during registration');
    },
  });
}

export function useGetAuthenticatedClient(enabled: boolean = true) {
  return useQuery<{
    id: number;
    email: string;
    appId: string;
    redirectUris: string[];
  }>({
    queryKey: ['clientProfile'],
    queryFn: async () => {
      const response = await clientApi.getAuthenticatedClient();
      return response.data;
    },
    enabled,
  });
}

export function useUpdateClientProfile() {
  return useMutation({
    mutationFn: (params: { clientId: string; data: ClientUpdateRequestDto }) =>
      clientApi
        .updateProfile(params.clientId, params.data)
        .then((res) => res.data),
    onSuccess: () => {
      toast.success('Profile updated');
    },
    onError: () => {
      toast.error('An error occurred while updating your profile');
    },
  });
}

export function useClientLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => clientApi.clientLogout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['clientProfile'] });
      toast.success('Logged out');
      router.push('/');
    },
    onError: () => {
      toast.error('An error occurred while logging out');
    },
  });
}
