import { UserRole } from '../database/entities/user.entity.js';

export interface AuthenticatedUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}
