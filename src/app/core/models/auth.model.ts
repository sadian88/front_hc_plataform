export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLogin: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  sessionToken: string;
}
