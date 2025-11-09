export interface OAuthUser {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: string;
  providerId: string;
}