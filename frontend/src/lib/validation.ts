import { z } from 'zod';

export const ClientSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const ProjectSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format'),
  name: z.string().min(1, 'Project name is required'),
  quotedBudget: z.number().min(0, 'Budget must be positive'),
  actualProjectCost: z.number().min(0, 'Cost must be positive'),
  subcontractorPct: z.number().min(0).max(100, 'Must be between 0 and 100'),
  salespersonPct: z.number().min(0).max(100, 'Must be between 0 and 100'),
});

export const EventSchema = z
  .object({
    clientId: z.string().min(1, 'Client is required'),
    title: z.string().min(1, 'Title is required'),
    start: z.string().datetime('Invalid start date'),
    end: z.string().datetime('Invalid end date'),
    allDay: z.boolean().optional(),
    type: z.enum(['WORK', 'MEETING', 'DEADLINE', 'LEAVE', 'OTHER']),
    status: z.enum(['TENTATIVE', 'CONFIRMED', 'CANCELLED']),
    projectId: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    rrule: z.string().optional(),
    exdates: z.array(z.string().datetime()).optional(),
  })
  .refine((data) => new Date(data.end) > new Date(data.start), {
    message: 'End time must be after start time',
    path: ['end'],
  });

export type ClientFormData = z.infer<typeof ClientSchema>;
export type ProjectFormData = z.infer<typeof ProjectSchema>;
export type EventFormData = z.infer<typeof EventSchema>;
