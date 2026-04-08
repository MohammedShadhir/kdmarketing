import {
  User,
  SalesLoginCredentials,
  SubContractorLoginCredentials,
  AuthSession,
} from "@/types/auth";
import { supabase } from "./supabase";

const AUTH_STORAGE_KEY = "pm_auth_session";

function extractErrorMessage(error: any, fallback: string): string {
  try {
    const body = error?.context?.body;

    if (body) {
      const parsed = JSON.parse(body);
      return parsed.error || fallback;
    }

    return error.message || fallback;
  } catch {
    return error.message || fallback;
  }
}

// Sales login
export async function loginAsSales(
  credentials: SalesLoginCredentials,
): Promise<User> {
  const { data, error } = await supabase.functions.invoke("auth-login", {
    body: {
      email: credentials.email,
      password: credentials.password,
      userType: "sales",
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "Sales login failed"));
  }

  if (data?.error) throw new Error(data.error);

  const user: User = data.user;
  saveSession(user);
  return user;
}

// Subcontractor login
export async function loginAsSubContractor(
  credentials: SubContractorLoginCredentials,
): Promise<User> {
  const { data, error } = await supabase.functions.invoke("auth-login", {
    body: {
      email: credentials.email,
      password: credentials.password,
      userType: "subcontractor",
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "Subcontractor login failed"));
  }
  if (data?.error) throw new Error(data.error);

  const user: User = data.user;
  saveSession(user);
  return user;
}

// Logout
export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Get current user from session
export function getCurrentUser(): User | null {
  const sessionStr = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!sessionStr) return null;

  try {
    const session: AuthSession = JSON.parse(sessionStr);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (now - session.timestamp > twentyFourHours) {
      logout();
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

// Save session
function saveSession(user: User): void {
  const session: AuthSession = { user, timestamp: Date.now() };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}
