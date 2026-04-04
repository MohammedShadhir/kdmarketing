import { formatCurrency } from '@/lib/dates';
import { ProjectCalculation } from '@/types/domain';

interface Props {
  projectCount: number;
  totals: ProjectCalculation;
}

export function MonthSummaryCards({ projectCount, totals }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-6">
      {}
      <div className="metric-card bg-emerald-50 border-emerald-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Projects</div>
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-3xl font-bold text-emerald-900">{projectCount}</div>
        <div className="text-xs text-emerald-600 mt-1">Total this period</div>
      </div>

      {}
      <div className="metric-card bg-[#8B5CF6]/10 border-[#8B5CF6]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-[#8B5CF6] uppercase tracking-wide">Gross</div>
          <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-3xl font-bold text-[#8B5CF6]">
          {formatCurrency(totals.gross)}
        </div>
        <div className="text-xs text-[#8B5CF6]/70 mt-1">Total revenue</div>
      </div>

      {}
      <div className="metric-card bg-[#F59E0B]/10 border-[#F59E0B]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wide">Subcon</div>
          <svg className="w-5 h-5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="text-3xl font-bold text-[#F59E0B]">
          {formatCurrency(totals['subcon$'])}
        </div>
        <div className="text-xs text-[#F59E0B]/70 mt-1">Contractor costs</div>
      </div>

      {}
      <div className="metric-card bg-[#3B82F6]/10 border-[#3B82F6]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-[#3B82F6] uppercase tracking-wide">Sales</div>
          <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-3xl font-bold text-[#3B82F6]">
          {formatCurrency(totals['sales$'])}
        </div>
        <div className="text-xs text-[#3B82F6]/70 mt-1">Commission paid</div>
      </div>

      {}
      <div className="metric-card bg-[#10B981]/10 border-[#10B981]/20">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-[#10B981] uppercase tracking-wide">Profit</div>
          <svg className="w-5 h-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="text-3xl font-bold text-[#10B981]">
          {formatCurrency(totals['company$'])}
        </div>
        <div className="text-xs text-[#10B981]/70 mt-1">Net profit</div>
      </div>
    </div>
  );
}
