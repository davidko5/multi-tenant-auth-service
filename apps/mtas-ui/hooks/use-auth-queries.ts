'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { clientApi, userApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  UserLoginRequest,
  UserLoginResponse,
  UserRegisterRequest,
  ClientLoginRequest,
  ClientRegisterRequest,
  ClientUpdateRequest,
} from '@/types/auth';
import { useRouter } from 'next/navigation';
import { AxiosResponse } from 'axios';

// User authentication hooks
export function useUserLogin() {
  return useMutation<
    AxiosResponse<UserLoginResponse>,
    Error,
    UserLoginRequest
  >({
    mutationFn: (credentials: UserLoginRequest) =>
      userApi.login(credentials),
    onSuccess: (data) => {
      return data;
    },
    onError: () => {
      toast.error('An error occurred during login');
    },
  });
}

export function useUserRegister() {
  return useMutation({
    mutationFn: (userData: UserRegisterRequest) =>
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
    mutationFn: (credentials: ClientLoginRequest) =>
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
    mutationFn: (clientData: ClientRegisterRequest) =>
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
    mutationFn: (params: { clientId: string; data: ClientUpdateRequest }) =>
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
