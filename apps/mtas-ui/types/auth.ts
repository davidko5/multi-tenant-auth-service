export interface UserLoginRequest {
  email: string;
  password: string;
  appId: string;
  redirectUri: string;
}

export interface UserRegisterRequest {
  name: string;
  appId: string;
  email: string;
  password: string;
}

export interface UserLoginResponse {
  authCode: string;
}

export interface ClientLoginRequest {
  email: string;
  password: string;
}

export interface ClientRegisterRequest {
  email: string;
  password: string;
}

export interface ClientUpdateRequest {
  updatedAppId?: string;
  updatedRedirectUris?: string[];
}
