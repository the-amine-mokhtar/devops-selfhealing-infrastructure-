export interface User {
  id?: number;
  fullName: string;
  email: string;
  role: string;
}

export interface UserFormValue {
  fullName: string;
  email: string;
  role: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}