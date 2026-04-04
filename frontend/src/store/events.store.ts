import { create } from 'zustand';
import { CalendarEvent, EventType, EventStatus } from '@/types/domain';
import { getAppointments, createAppointment } from '@/services/supabaseGHL';

type EventsState = {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  fetchEvents: (startDate?: string, endDate?: string, calendarId?: string, locationId?: string) => Promise<void>;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  listBySubContractor: (subContractorId: string) => CalendarEvent[];
};

function mapGHLAppointmentToEvent(ghlAppointment: any): CalendarEvent {
  const statusMap: Record<string, EventStatus> = {
    'confirmed': 'CONFIRMED',
    'tentative': 'TENTATIVE',
    'cancelled': 'CANCELLED',
  };

  return {
    id: ghlAppointment.id,
    subContractorId: ghlAppointment.contactId || '',
    title: ghlAppointment.title || 'Appointment',
    start: ghlAppointment.startTime,
    end: ghlAppointment.endTime || ghlAppointment.startTime,
    allDay: false,
    type: 'MEETING' as EventType,
    status: statusMap[ghlAppointment.appointmentStatus] || 'TENTATIVE',
    location: ghlAppointment.location || '',
    notes: ghlAppointment.notes || '',
    createdAt: ghlAppointment.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapEventToGHLAppointment(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>, calendarId: string) {
  const statusMap: Record<EventStatus, string> = {
    'CONFIRMED': 'confirmed',
    'TENTATIVE': 'tentative',
    'CANCELLED': 'cancelled',
  };

  return {
    calendarId,
    contactId: event.subContractorId,
    startTime: event.start,
    endTime: event.end,
    title: event.title,
    appointmentStatus: statusMap[event.status] || 'tentative',
    notes: event.notes || '',
    location: event.location || '',
  };
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async (startDate?: string, endDate?: string, calendarId?: string, locationId?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getAppointments(startDate, endDate, calendarId, locationId);

      const events = (response.events || []).map(mapGHLAppointmentToEvent);

      set({ events, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch events', loading: false });
    }
  },

  createEvent: async (eventInput) => {
    set({ loading: true, error: null });
    try {

      const calendarId = import.meta.env.VITE_GHL_CALENDAR_ID || '';

      if (!calendarId) {
        throw new Error('Calendar ID not configured. Please set VITE_GHL_CALENDAR_ID in .env');
      }

      const appointmentData = mapEventToGHLAppointment(eventInput, calendarId);

      const result = await createAppointment(appointmentData);

      if (result.success && result.appointment) {
        const newEvent = mapGHLAppointmentToEvent(result.appointment);
        set((state) => ({
          events: [...state.events, newEvent],
          loading: false
        }));
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create event', loading: false });
      throw error;
    }
  },

  updateEvent: (id, patch) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e
      ),
    })),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),

  listBySubContractor: (subContractorId) => {
    return get().events.filter((e) => e.subContractorId === subContractorId);
  },
}));
