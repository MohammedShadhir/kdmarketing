import { Project, ProjectCalculation, MonthSummary } from '../types';

export function calcProject(project: Project): ProjectCalculation {
  const revenue = project.quotedBudget;
  const expense = project.actualProjectCost;
  const subcontractorCut = revenue * (project.subcontractorPct / 100);
  const salespersonCommission = revenue * (project.salespersonPct / 100);
  const companyMargin = revenue - expense - subcontractorCut - salespersonCommission;

  return {
    revenue,
    expense,
    subcontractorCut,
    salespersonCommission,
    companyMargin,
  };
}

export function sumMonth(projects: Project[]): MonthSummary {
  const calcs = projects.map(calcProject);

  return {
    totalRevenue: calcs.reduce((sum, c) => sum + c.revenue, 0),
    totalExpense: calcs.reduce((sum, c) => sum + c.expense, 0),
    totalSubcontractorCut: calcs.reduce((sum, c) => sum + c.subcontractorCut, 0),
    totalSalespersonCommission: calcs.reduce((sum, c) => sum + c.salespersonCommission, 0),
    totalCompanyMargin: calcs.reduce((sum, c) => sum + c.companyMargin, 0),
    projectCount: projects.length,
  };
}

export function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    return `${sign}₹${(absAmount / 10000000).toFixed(2)}Cr`;
  } else if (absAmount >= 100000) {
    return `${sign}₹${(absAmount / 100000).toFixed(2)}L`;
  } else if (absAmount >= 1000) {
    return `${sign}₹${(absAmount / 1000).toFixed(1)}K`;
  } else {
    return `${sign}₹${absAmount.toFixed(0)}`;
  }
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}
