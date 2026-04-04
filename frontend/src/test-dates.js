
const { parseISO, startOfMonth, endOfMonth, format } = require('date-fns');

const yearMonth = '2025-10';
const projectStart = '2025-10-08';
const projectEnd = '2025-10-22';

const monthStart = startOfMonth(parseISO(yearMonth + '-01'));
const monthEnd = endOfMonth(monthStart);

const pStart = parseISO(projectStart);
const pEnd = parseISO(projectEnd);

);
);
);
);

const intersects = pStart <= monthEnd && pEnd >= monthStart;
