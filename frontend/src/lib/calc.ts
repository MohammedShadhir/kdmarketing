import { Project, ProjectCalculation } from '@/types/domain';

export function calcProjectSaved(p: Project): ProjectCalculation {
  const gross = p.projectPrice;
  const subcon = gross * (p.subcontractorPercentage / 100);
  const sales = gross * (p.salesCommissionPercentage / 100);

  const refundAmount = (p.isDiscontinued && p.refundAmount) ? p.refundAmount : 0;
  const company = gross - subcon - sales - refundAmount;

  return {
    gross,
    'subcon$': subcon,
    'sales$': sales,
    'company$': company
  };
}

export function calcProjectSimulated(
  p: Project,
  overrideSubconPct?: number,
  overrideSalesPct?: number
): ProjectCalculation {
  const gross = p.projectPrice;
  const subconPct = overrideSubconPct ?? p.subcontractorPercentage;
  const salesPct = overrideSalesPct ?? p.salesCommissionPercentage;

  const subcon = gross * (subconPct / 100);
  const sales = gross * (salesPct / 100);
  const company = gross - subcon - sales;
  return {
    gross,
    'subcon$': subcon,
    'sales$': sales,
    'company$': company
  };
}

export function sumRows(rows: ProjectCalculation[]): ProjectCalculation {
  return rows.reduce(
    (a, r) => ({
      gross: a.gross + r.gross,
      'subcon$': a['subcon$'] + r['subcon$'],
      'sales$': a['sales$'] + r['sales$'],
      'company$': a['company$'] + r['company$'],
    }),
    { gross: 0, 'subcon$': 0, 'sales$': 0, 'company$': 0 }
  );
}
