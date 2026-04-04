export type UserRole = 'sales' | 'subcontractor' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  subContractorId?: string;
  default_sales_commission?: number;
  profilePictureUrl?: string;
  lastLogin?: string;
}

export interface AuthSession {
  user: User;
  timestamp: number;
}

export interface SalesLoginCredentials {
  email: string;
  password: string;
}

export interface SubContractorLoginCredentials {
  email: string;
  password: string;
}
