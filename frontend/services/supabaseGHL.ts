import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FUNCTIONS_URL = `${supabaseUrl}/functions/v1`;


export interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  source?: string;
  country?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  dateAdded?: string;
  locationId: string;
}

export interface CreateContactData {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  source?: string;
  country?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface Appointment {
  id: string;
  calendarId: string;
  contactId: string;
  locationId: string;
  title: string;
  startTime: string;
  endTime?: string;
  appointmentStatus?: string;
  notes?: string;
}

export interface CreateAppointmentData {
  calendarId: string;
  contactId: string;
  startTime: string;
  endTime?: string;
  title?: string;
  appointmentStatus?: string;
  notes?: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  total?: number;
  count?: number;
}

export interface AppointmentsResponse {
  events: Appointment[];
  total?: number;
}


const callFunction = async <T>(
  functionName: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    params?: Record<string, string>;
  } = {}
): Promise<T> => {
  try {
    let url = `${FUNCTIONS_URL}/${functionName}`;

    if (options.params) {
      const queryString = new URLSearchParams(options.params).toString();
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: options.body ? JSON.stringify(options.body) : null
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || 'API call failed');
    }

    return await response.json();
  } catch (error) {
    ;
    throw error;
  }
};


export const getContacts = async (
  limit = 100,
  skip = 0,
  query?: string
): Promise<ContactsResponse> => {
  const params: Record<string, string> = {
    limit: limit.toString(),
    skip: skip.toString()
  };

  if (query) {
    params.query = query;
  }

  return await callFunction<ContactsResponse>('ghl-contacts', { params });
};

export const createContact = async (
  contactData: CreateContactData
): Promise<{ success: boolean; contact: Contact }> => {
  return await callFunction<{ success: boolean; contact: Contact }>(
    'ghl-create-contact',
    {
      method: 'POST',
      body: contactData
    }
  );
};


export const getAppointments = async (
  startDate?: string,
  endDate?: string,
  calendarId?: string
): Promise<AppointmentsResponse> => {
  const params: Record<string, string> = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (calendarId) params.calendarId = calendarId;

  return await callFunction<AppointmentsResponse>('ghl-appointments', { params });
};

export const createAppointment = async (
  appointmentData: CreateAppointmentData
): Promise<{ success: boolean; appointment: Appointment }> => {
  return await callFunction<{ success: boolean; appointment: Appointment }>(
    'ghl-appointments',
    {
      method: 'POST',
      body: appointmentData
    }
  );
};
