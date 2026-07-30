export interface LoginParams {
  userId: string;
  password: string;
  [key: string]: any;
}

export interface ApiResponse {
  state: string;
  [key: string]: any;
}

