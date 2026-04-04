import { User, SalesLoginCredentials, SubContractorLoginCredentials, AuthSession } from '@/types/auth';
import { supabase } from './supabase';

const AUTH_STORAGE_KEY = 'pm_auth_session';

export async function loginAsSales(credentials: SalesLoginCredentials): Promise<User> {
  try {
    const { data, error } = await supabase.functions.invoke('auth-login', {
      body: {
        email: credentials.email,
        password: credentials.password,
        userType: 'sales'
      }
    });

    if (error) {
            throw new Error(error.message || 'Login failed');
    }

    if (data?.error) {
                  throw new Error(data.error);
    }

    const user: User = data.user;
    saveSession(user);
    return user;
  } catch (error: any) {
        throw new Error(error.message || 'Invalid credentials');
  }
}

export async function loginAsSubContractor(credentials: SubContractorLoginCredentials): Promise<User> {
  try {
    const { data, error } = await supabase.functions.invoke('auth-login', {
      body: {
        email: credentials.email,
        password: credentials.password,
        userType: 'subcontractor'
      }
    });

    if (error) {
      throw new Error(error.message || 'Login failed');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    const user: User = data.user;
    saveSession(user);
    return user;
  } catch (error: any) {
        throw new Error(error.message || 'Invalid credentials');
  }
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getCurrentUser(): User | null {
  const sessionStr = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!sessionStr) return null;

  try {
    const session: AuthSession = JSON.parse(sessionStr);

    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (sessionAge > twentyFourHours) {
      logout();
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function isSales(): boolean {
  const user = getCurrentUser();
  return user?.role === 'sales';
}

export function isSubContractor(): boolean {
  const user = getCurrentUser();
  return user?.role === 'subcontractor';
}

function saveSession(user: User): void {
  const session: AuthSession = {
    user,
    timestamp: Date.now()
  };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
