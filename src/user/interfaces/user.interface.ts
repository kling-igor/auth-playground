export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: [string];
  refreshToken: string;
  expirationDate: Date;
}
