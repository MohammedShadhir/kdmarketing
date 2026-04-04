import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { YearMonth, ISODateTime } from '../types';

export function getCurrentMonth(): YearMonth {
  return format(new Date(), 'yyyy-MM');
}

export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatMonth(month: YearMonth): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return format(date, 'MMMM yyyy');
}

export function getMonthStart(month: YearMonth): ISODateTime {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return startOfMonth(date).toISOString();
}

export function getMonthEnd(month: YearMonth): ISODateTime {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return endOfMonth(date).toISOString();
}

export function rangesOverlap(
  aStart: ISODateTime,
  aEnd: ISODateTime,
  bStart: ISODateTime,
  bEnd: ISODateTime
): boolean {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}

export function generateMonthOptions(): { value: YearMonth; label: string }[] {
  const options: { value: YearMonth; label: string }[] = [];
  const now = new Date();

  for (let i = -12; i <= 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = format(date, 'yyyy-MM');
    const label = format(date, 'MMMM yyyy');
    options.push({ value, label });
  }

  return options;
}
