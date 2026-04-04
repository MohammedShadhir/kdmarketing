import { useMemo } from 'react';
import { Project } from '@/types/domain';
import { formatCurrency } from '@/lib/dates';

interface Props {
  projects: Project[];
  totals: {
    gross: number;
    subcon$: number;
    sales$: number;
    company$: number;
  };
}

export function PaymentSummaryCards({ projects, totals }: Props) {
  const paymentSummary = useMemo(() => {
    let clientPaid = 0;
    let advancePayments = 0;
    let paidToSubcontractor = 0;
    let paidToSales = 0;
    let totalRefunds = 0;

    projects.forEach(project => {
      if (project.advancePaymentAmount) {
        advancePayments += project.advancePaymentAmount;
      }

      if (project.refundAmount && project.isDiscontinued) {
        totalRefunds += project.refundAmount;
      }

      if (Array.isArray(project.payments)) {
        project.payments.forEach(payment => {
          if (payment.paymentType === 'client_payment') {
            clientPaid += payment.amount;
          } else if (payment.paymentType === 'subcontractor_payment') {
            paidToSubcontractor += payment.amount;
          } else if (payment.paymentType === 'sales_payment') {
            paidToSales += payment.amount;
          } else if (payment.paymentType === 'subcontractor_check_collected') {
            paidToSubcontractor += payment.amount;
          }
        });
      }
    });

    const totalClientPaid = clientPaid + advancePayments;
    const netClientPaid = totalClientPaid - totalRefunds;
    const clientRemainingBalance = totals.gross - totalClientPaid;
    const remainingSubcontractor = totals.subcon$ - paidToSubcontractor;
    const remainingSales = totals.sales$ - paidToSales;
    const totalRemaining = remainingSubcontractor + remainingSales;
    const totalAllocated = totals.subcon$ + totals.sales$;
    const totalPaid = paidToSubcontractor + paidToSales;

    return {
      clientPaid,
      advancePayments,
      totalClientPaid,
      netClientPaid,
      totalRefunds,
      clientRemainingBalance,
      paidToSubcontractor,
      paidToSales,
      remainingSubcontractor,
      remainingSales,
      totalRemaining,
      totalAllocated,
      totalPaid,
    };
  }, [projects, totals]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
      {}
      <div className="bg-white rounded-xl shadow-md border-2 border-cyan-200 hover:shadow-lg transition-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Client Paid
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-4xl font-bold text-cyan-600 mb-1">{formatCurrency(paymentSummary.totalClientPaid)}</p>
            <p className="text-sm text-gray-500">Total payments received</p>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Advance Payments</span>
              <span className="font-semibold text-cyan-700">{formatCurrency(paymentSummary.advancePayments)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Manual Payments</span>
              <span className="font-semibold text-cyan-700">{formatCurrency(paymentSummary.clientPaid)}</span>
            </div>
            {paymentSummary.totalRefunds > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Refunds</span>
                <span className="font-semibold text-red-600">-{formatCurrency(paymentSummary.totalRefunds)}</span>
              </div>
            )}
          </div>

          {paymentSummary.totalRefunds > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Received</span>
                <span className="text-lg font-bold text-cyan-700">
                  {formatCurrency(paymentSummary.netClientPaid)}
                </span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Client Owes</span>
              <span className={`text-lg font-bold ${paymentSummary.clientRemainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatCurrency(paymentSummary.clientRemainingBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-md border-2 border-amber-200 hover:shadow-lg transition-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Paid to Sub-Contractor
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-4xl font-bold text-amber-600">{formatCurrency(paymentSummary.paidToSubcontractor)}</p>
            </div>
            <p className="text-sm text-gray-500">of {formatCurrency(totals.subcon$)} allocated</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="text-lg font-bold text-amber-700">{formatCurrency(paymentSummary.remainingSubcontractor)}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Progress</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                paymentSummary.remainingSubcontractor > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {totals.subcon$ > 0 ? Math.round((paymentSummary.paidToSubcontractor / totals.subcon$) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${totals.subcon$ > 0 ? Math.min((paymentSummary.paidToSubcontractor / totals.subcon$) * 100, 100) : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-md border-2 border-rose-200 hover:shadow-lg transition-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Paid to Sales
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-4xl font-bold text-rose-600">{formatCurrency(paymentSummary.paidToSales)}</p>
            </div>
            <p className="text-sm text-gray-500">of {formatCurrency(totals.sales$)} allocated</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="text-lg font-bold text-rose-700">{formatCurrency(paymentSummary.remainingSales)}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Progress</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                paymentSummary.remainingSales > 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {totals.sales$ > 0 ? Math.round((paymentSummary.paidToSales / totals.sales$) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-rose-500 to-rose-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${totals.sales$ > 0 ? Math.min((paymentSummary.paidToSales / totals.sales$) * 100, 100) : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-md border-2 border-indigo-200 hover:shadow-lg transition-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Total Remaining
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-4xl font-bold text-indigo-600 mb-1">{formatCurrency(paymentSummary.totalRemaining)}</p>
            <p className="text-sm text-gray-500">to be paid this month</p>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center py-2 px-3 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Sub-Contractor</span>
              <span className="text-base font-bold text-amber-700">{formatCurrency(paymentSummary.remainingSubcontractor)}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-rose-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Sales Person</span>
              <span className="text-base font-bold text-rose-700">{formatCurrency(paymentSummary.remainingSales)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Total Paid</span>
              <span className="text-lg font-bold text-indigo-700">{formatCurrency(paymentSummary.totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                paymentSummary.totalRemaining > 0
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {paymentSummary.totalAllocated > 0 ? Math.round((paymentSummary.totalPaid / paymentSummary.totalAllocated) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${paymentSummary.totalAllocated > 0 ? Math.min((paymentSummary.totalPaid / paymentSummary.totalAllocated) * 100, 100) : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {}
      {paymentSummary.totalRefunds > 0 && (
        <div className="bg-white rounded-xl shadow-md border-2 border-red-200 hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Refunds
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-4xl font-bold text-red-600 mb-1">{formatCurrency(paymentSummary.totalRefunds)}</p>
              <p className="text-sm text-gray-500">Total refunded to clients</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-gray-600">
                    This amount has been refunded to clients for discontinued projects and is subtracted from total payments received.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
