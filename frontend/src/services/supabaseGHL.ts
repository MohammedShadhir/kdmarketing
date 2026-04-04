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
  locationId?: string;
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
  locationId?: string;
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
    throw error;
  }
};

export const getContacts = async (
  limit = 100,
  skip = 0,
  query?: string,
  locationId?: string,
  fetchAll = false
): Promise<ContactsResponse> => {
  const params: Record<string, string> = {};

  if (query) {
    params.query = query;
  }

  if (locationId) {
    params.locationId = locationId;
  }

  if (fetchAll) {
    params.fetchAll = 'true';
  } else {
    params.limit = limit.toString();
    params.skip = skip.toString();
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
  calendarId?: string,
  locationId?: string
): Promise<AppointmentsResponse> => {
  const params: Record<string, string> = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (calendarId) params.calendarId = calendarId;
  if (locationId) params.locationId = locationId;

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

export const getContactsFromAllAccounts = async (
  limit = 50,
  skip = 0,
  query?: string,
  fetchAll = false,
  onProgress?: (accountName: string, accountIndex: number, totalAccounts: number, contactCount: number) => void
): Promise<Array<{ accountName: string; locationId: string; contacts: Contact[]; totalContacts: number }>> => {
  try {
    const { data: accounts, error: accountsError } = await supabase
      .from('ghl_accounts')
      .select('id, account_name, location_id')
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('account_name', { ascending: true });

    if (accountsError) {
      throw accountsError;
    }

    if (!accounts || accounts.length === 0) {
      return [];
    }

    const shouldFetchAll = fetchAll || !!(query && query.trim().length > 0);

    const results: Array<{ accountName: string; locationId: string; contacts: Contact[]; totalContacts: number }> = [];

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      try {

        const response = await getContacts(limit, skip, query, account.location_id, shouldFetchAll);
        const contactCount = response.contacts?.length || 0;

        results.push({
          accountName: account.account_name,
          locationId: account.location_id,
          contacts: response.contacts || [],
          totalContacts: response.total || contactCount,
        });

        if (onProgress) {
          onProgress(account.account_name, i + 1, accounts.length, contactCount);
        }
      } catch (error) {
        results.push({
          accountName: account.account_name,
          locationId: account.location_id,
          contacts: [],
          totalContacts: 0,
        });

        if (onProgress) {
          onProgress(`${account.account_name} (error)`, i + 1, accounts.length, 0);
        }
      }
    }

    // Removed the unused variable - this line was causing the error
    // const totalContacts = results.reduce((sum, r) => sum + r.totalContacts, 0);

    return results;
  } catch (error) {
    throw error;
  }
};

export interface Opportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId?: string;
  contactId?: string;
  locationId: string;
  monetaryValue?: number;
  status?: string;
  customFields?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOpportunityData {
  pipelineId: string;
  name: string;
  contactId?: string;
  monetaryValue?: number;
  status?: string;
  pipelineStageId?: string;
  customFields?: Record<string, any>;
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  total?: number;
}

export const getOpportunities = async (
  pipelineId?: string,
  contactId?: string,
  limit = 100
): Promise<OpportunitiesResponse> => {
  const params: Record<string, string> = {
    limit: limit.toString()
  };

  if (pipelineId) params.pipelineId = pipelineId;
  if (contactId) params.contactId = contactId;

  return await callFunction<OpportunitiesResponse>('ghl-opportunities', { params });
};

export const createOpportunity = async (
  opportunityData: CreateOpportunityData
): Promise<{ success: boolean; opportunity: Opportunity }> => {
  return await callFunction<{ success: boolean; opportunity: Opportunity }>(
    'ghl-opportunities',
    {
      method: 'POST',
      body: opportunityData
    }
  );
};