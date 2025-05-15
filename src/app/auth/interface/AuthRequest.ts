export interface AuthRequest {
  grant_type: string;
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
}
