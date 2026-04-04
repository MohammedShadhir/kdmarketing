import { CalendarEvent, ID, ISODateTime } from '../types';
import { rangesOverlap } from './date';

export function detectConflicts(events: CalendarEvent[]): Record<ID, ID[]> {
  const sorted = [...events].sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const conflicts: Record<ID, ID[]> = {};

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (new Date(sorted[j].start) >= new Date(sorted[i].end)) break;

      if (!conflicts[sorted[i].id]) conflicts[sorted[i].id] = [];
      if (!conflicts[sorted[j].id]) conflicts[sorted[j].id] = [];

      conflicts[sorted[i].id].push(sorted[j].id);
      conflicts[sorted[j].id].push(sorted[i].id);
    }
  }

  return conflicts;
}

export function filterEventsByRange(
  events: CalendarEvent[],
  clientId: ID,
  startISO: ISODateTime,
  endISO: ISODateTime
): CalendarEvent[] {
  return events.filter(
    (e) => e.clientId === clientId && rangesOverlap(e.start, e.end, startISO, endISO)
  );
}

export function getEventTypeColor(type: CalendarEvent['type']): string {
  const colors = {
    WORK: 'bg-emerald-500',
    MEETING: 'bg-blue-500',
    DEADLINE: 'bg-amber-500',
    LEAVE: 'bg-gray-500',
    OTHER: 'bg-violet-500',
  };
  return colors[type];
}

export function getEventStatusBorder(status: CalendarEvent['status']): string {
  const styles = {
    CONFIRMED: 'border-2 border-solid',
    TENTATIVE: 'border-2 border-dashed',
    CANCELLED: 'border-2 border-solid opacity-50',
  };
  return styles[status];
}

export function calculateScheduledHours(events: CalendarEvent[]): number {
  return events
    .filter((e) => e.type === 'WORK' && !e.allDay)
    .reduce((total, event) => {
      const start = new Date(event.start).getTime();
      const end = new Date(event.end).getTime();
      const hours = (end - start) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
}
