export type UserRole = 'employee' | 'employer';

export interface IUser {
  userId: string;
  userImage: string;
  firstName: string;
  lastName?: string;
  role?: UserRole;
}
