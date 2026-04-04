export type ID = string;
export type YearMonth = string;
export type ISODate = string;
export type ISODateTime = string;

export type PaymentMethod = 'Cash 💵' | 'Cheque' | 'Credit card 💳' | 'Venmo' | 'Zelle';
export type PaymentType = 'client_payment' | 'subcontractor_payment' | 'sales_payment' | 'subcontractor_check_collected';
export type PaymentRecipient = 'subcontractor' | 'sales_person';
export type ProjectVisibility = 'public' | 'unlisted' | 'private';

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: ISODate;
  taxPercentage: number;
  taxAmount: number;
  paymentType: PaymentType;
  paidTo?: PaymentRecipient;
  paidToSalesPerson?: string;
  notes?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: ISODateTime;
}

export interface SubContractor {
  id: ID;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  defaultSubcontractorPercentage?: number;
  defaultSalesPercentage?: number;
  address?: string;
  notes?: string;
  profilePictureUrl?: string;
  lastKnownLat?: number;
  lastKnownLng?: number;
  lastSeenAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Project {
  id: ID;
  subContractorId: ID;
  title: string;
  description?: string;
  customerName?: string;
  customerId?: string;
  projectPrice: number;
  subcontractorPercentage: number;
  salesCommissionPercentage: number;
  salesPerson?: string;
  advancePaymentAmount?: number;
  advancePaymentTaxPercentage?: number;
  advancePaymentTaxAmount?: number;
  modeOfPayment?: string;
  startDate?: ISODate;
  endDate?: ISODate;
  notes?: string;
  status?: string;
  visibility?: ProjectVisibility;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  defaultTaxPercentage?: number;
  payments?: Payment[];
  totalPaymentsReceived?: number;
  totalTaxCollected?: number;
  remainingBalance?: number;
  refundAmount?: number;
  refundDate?: ISODate;
  isDiscontinued?: boolean;
  mediaFiles?: MediaFile[];
  reviewCollected?: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ProjectCalculation {
  gross: number;
  subcon$: number;
  sales$: number;
  company$: number;
}

export type EventType = 'MEETING' | 'CALL' | 'TASK' | 'OTHER';
export type EventStatus = 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';

export interface CalendarEvent {
  id: ID;
  subContractorId: ID;
  title: string;
  start: ISODateTime;
  end: ISODateTime;
  allDay: boolean;
  type: EventType;
  status: EventStatus;
  location?: string;
  notes?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface GHLAccount {
  id: ID;
  accountName: string;
  locationId: string;
  apiToken: string;
  calendarId?: string;
  pipelineId?: string;
  isActive: boolean;
  isDefault: boolean;
  notes?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface GHLAccountDisplay {
  id: ID;
  accountName: string;
  locationId: string;
  calendarId?: string;
  pipelineId?: string;
  isActive: boolean;
  isDefault: boolean;
  notes?: string;
  createdAt: ISODateTime;
}

export interface GHLAccountInput {
  accountName: string;
  locationId: string;
  apiToken: string;
  calendarId?: string;
  pipelineId?: string;
  isActive?: boolean;
  isDefault?: boolean;
  notes?: string;
}
