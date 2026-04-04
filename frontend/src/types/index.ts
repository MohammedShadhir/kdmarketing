export type ID = string;
export type YearMonth = string;
export type ISODateTime = string;

export type EventType = 'WORK' | 'MEETING' | 'DEADLINE' | 'LEAVE' | 'OTHER';
export type EventStatus = 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
export interface Client {
  id: ID;
  displayName: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Project {
  id: ID;
  clientId: ID;
  month: YearMonth;
  name: string;
  quotedBudget: number;
  actualProjectCost: number;
  subcontractorPct: number;
  salespersonPct: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface CalendarEvent {
  id: ID;
  clientId: ID;
  title: string;
  start: ISODateTime;
  end: ISODateTime;
  allDay?: boolean;
  type: EventType;
  status: EventStatus;
  projectId?: ID;
  location?: string;
  notes?: string;
  rrule?: string;
  exdates?: ISODateTime[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ProjectCalculation {
  revenue: number;
  expense: number;
  subcontractorCut: number;
  salespersonCommission: number;
  companyMargin: number;
}

export interface MonthSummary {
  totalRevenue: number;
  totalExpense: number;
  totalSubcontractorCut: number;
  totalSalespersonCommission: number;
  totalCompanyMargin: number;
  projectCount: number;
}

export type ClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type CalendarEventInput = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;
