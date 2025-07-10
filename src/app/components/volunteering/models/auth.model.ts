export interface SignupRequest {
  fullName: string;
  age: number;
  email: string; // now required
  address: string;
  contactNo: string;
  password: string;
  skills: string[];
}

export interface SignupResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  tokenType: string;   // “Bearer”
  fullName: string;
  email: string;
  userId: number;
}
