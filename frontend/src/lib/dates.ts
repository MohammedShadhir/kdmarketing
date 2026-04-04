import { startOfMonth, endOfMonth, parseISO, format, isWithinInterval } from 'date-fns';
import { ISODate, YearMonth } from '@/types/domain';

export function getCurrentYearMonth(): YearMonth {
  return format(new Date(), 'yyyy-MM');
}

export function dateRangesIntersect(
  aStart: ISODate,
  aEnd: ISODate,
  bStart: ISODate,
  bEnd: ISODate
): boolean {
  return parseISO(aStart) <= parseISO(bEnd) && parseISO(bStart) <= parseISO(aEnd);
}

export function projectIntersectsMonth(
  projectStart?: ISODate,
  projectEnd?: ISODate,
  yearMonth?: YearMonth
): boolean {
  if (!projectStart || !projectEnd || !yearMonth) return false;
  const monthStart = startOfMonth(parseISO(yearMonth + '-01'));
  const monthEnd = endOfMonth(monthStart);
  const pStart = parseISO(projectStart);
  const pEnd = parseISO(projectEnd);
  return pStart <= monthEnd && pEnd >= monthStart;
}

export function isDayInRange(day: Date, start?: ISODate, end?: ISODate): boolean {
  if (!start || !end) return false;
  return isWithinInterval(day, {
    start: parseISO(start),
    end: parseISO(end),
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
