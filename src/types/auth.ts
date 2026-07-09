export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export type UserRole = "ADMIN" | "FINANCE_OFFICER" | "VIEWER";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RegisterUserResponse {
  user: AuthUser;
  emailSent: boolean;
  message: string;
}

export interface LoginChallengeResponse {
  requiresVerification: boolean;
  message: string;
  email: string;
}

export interface VerifyLoginInput {
  email: string;
  code: string;
}

export interface ResendCodeInput {
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  role: UserRole;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
