export interface User {
  id: number;
  name: string;
  email: string;
  password?: string | null;
  provider?: string | null;
  providerId?: string | null;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}