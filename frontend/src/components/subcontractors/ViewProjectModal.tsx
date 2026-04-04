import { useEffect, useState } from 'react';
import { Project, MediaFile } from '@/types/domain';
import { formatCurrency } from '@/lib/dates';
import { calcProjectSaved } from '@/lib/calc';
import { getProjectMedia } from '@/services/supabase';
import { MediaFileList } from '@/components/projects/MediaFileList';

interface Props {
  project: Project;
  onClose: () => void;
}

export function ViewProjectModal({ project, onClose }: Props) {
  const calc = calcProjectSaved(project);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  useEffect(() => {
    const fetchMediaFiles = async () => {
      if (project?.id) {
        try {
          const files = await getProjectMedia(project.id);
          setMediaFiles(files);
        } catch (error) {
          }
      }
    };

    fetchMediaFiles();
  }, [project?.id]);

  const payments = Array.isArray(project.payments) ? project.payments : [];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalTax = payments.reduce((sum, p) => sum + (p.taxAmount || 0), 0);
  const remaining = project.projectPrice - totalPaid;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-200">
        {}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 sm:px-8 py-4 sm:py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">Project Details</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {}
            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                Project Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Title</label>
                  <p className="text-sm sm:text-base text-gray-900 mt-1">{project.title}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Status</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      project.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                      project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status || 'Active'}
                    </span>
                  </p>
                </div>
                {project.description && (
                  <div className="sm:col-span-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-600">Description</label>
                    <p className="text-sm sm:text-base text-gray-700 mt-1">{project.description}</p>
                  </div>
                )}
              </div>
            </section>

            {}
            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Customer Name</label>
                  <p className="text-sm sm:text-base text-gray-900 mt-1">{project.customerName || 'N/A'}</p>
                </div>
                {project.customerId && (
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-600">Customer ID</label>
                    <p className="text-sm sm:text-base text-gray-700 mt-1 font-mono">{project.customerId}</p>
                  </div>
                )}
              </div>

              {}
              {(project.addressLine1 || project.city) && (
                <div className="mt-3 sm:mt-4">
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Address</label>
                  <div className="text-sm sm:text-base text-gray-700 mt-1">
                    {project.addressLine1 && <p>{project.addressLine1}</p>}
                    {project.addressLine2 && <p>{project.addressLine2}</p>}
                    {project.city && (
                      <p>
                        {project.city}
                        {project.state && `, ${project.state}`}
                        {project.zipcode && ` ${project.zipcode}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {}
            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                Financial Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Project Price</label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 mt-1">{formatCurrency(project.projectPrice)}</p>
                </div>
                {project.advancePaymentAmount !== undefined && project.advancePaymentAmount > 0 && (
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-600">Advance Payment</label>
                    <p className="text-base sm:text-lg font-semibold text-emerald-600 mt-1">
                      {formatCurrency(project.advancePaymentAmount)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Subcontractor %</label>
                  <p className="text-sm sm:text-base text-gray-900 mt-1">{project.subcontractorPercentage.toFixed(1)}%</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Sales Commission %</label>
                  <p className="text-sm sm:text-base text-gray-900 mt-1">{project.salesCommissionPercentage.toFixed(1)}%</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Subcontractor Amount</label>
                  <p className="text-base sm:text-lg font-semibold text-orange-600 mt-1">
                    {formatCurrency(calc['subcon$'])}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Sales Amount</label>
                  <p className="text-base sm:text-lg font-semibold text-blue-600 mt-1">
                    {formatCurrency(calc['sales$'])}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600">Company Profit</label>
                  <p className="text-base sm:text-lg font-semibold text-emerald-600 mt-1">
                    {formatCurrency(calc['company$'])}
                  </p>
                </div>
                {project.salesPerson && (
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-600">Sales Person</label>
                    <p className="text-sm sm:text-base text-gray-900 mt-1">{project.salesPerson}</p>
                  </div>
                )}
              </div>
            </section>

            {}
            {(project.startDate || project.endDate) && (
              <section>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  Timeline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {project.startDate && (
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-gray-600">Start Date</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{project.startDate}</p>
                    </div>
                  )}
                  {project.endDate && (
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-gray-600">End Date</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{project.endDate}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {}
            {payments.length > 0 && (
              <section>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  Payments
                </h3>

                {}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-emerald-700 font-medium">Total Paid</p>
                    <p className="text-lg sm:text-xl font-bold text-emerald-900 mt-1">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-blue-700 font-medium">Total Tax</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-900 mt-1">{formatCurrency(totalTax)}</p>
                  </div>
                  <div className={`rounded-lg p-3 sm:p-4 ${
                    remaining > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <p className={`text-xs sm:text-sm font-medium ${
                      remaining > 0 ? 'text-yellow-700' : 'text-gray-700'
                    }`}>Remaining</p>
                    <p className={`text-lg sm:text-xl font-bold mt-1 ${
                      remaining > 0 ? 'text-yellow-900' : 'text-gray-900'
                    }`}>{formatCurrency(remaining)}</p>
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  {payments.map((payment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
                            {payment.method || 'N/A'}
                          </span>
                          <span className="ml-2 text-xs sm:text-sm text-gray-600">{payment.date}</span>
                        </div>
                        <div className="text-base sm:text-lg font-bold text-gray-900">
                          {formatCurrency(payment.amount || 0)}
                        </div>
                      </div>

                      {payment.taxAmount !== undefined && payment.taxAmount > 0 && (
                        <div className="text-xs sm:text-sm text-gray-600 mb-2">
                          Tax: {formatCurrency(payment.taxAmount)} ({payment.taxPercentage?.toFixed(1)}%)
                        </div>
                      )}

                      {payment.paymentType && (
                        <div className="text-xs text-gray-600 mb-1">
                          Type: <span className="font-medium">{payment.paymentType}</span>
                        </div>
                      )}

                      {payment.paidTo && (
                        <div className="text-xs text-gray-600 mb-1">
                          Paid To: <span className="font-medium">{payment.paidTo}</span>
                          {payment.paidToSalesPerson && (
                            <span className="ml-1">({payment.paidToSalesPerson})</span>
                          )}
                        </div>
                      )}

                      {payment.notes && (
                        <div className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border border-gray-200">
                          {payment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {}
            {project.refundAmount !== undefined && project.refundAmount > 0 && (
              <section>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  Refund Information
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-red-700">Refund Amount</label>
                      <p className="text-base sm:text-lg font-bold text-red-900 mt-1">
                        {formatCurrency(project.refundAmount)}
                      </p>
                    </div>
                    {project.refundDate && (
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-red-700">Refund Date</label>
                        <p className="text-sm sm:text-base text-red-900 mt-1">{project.refundDate}</p>
                      </div>
                    )}
                  </div>
                  {project.isDiscontinued && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-700 text-white">
                        Project Discontinued
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {}
            {mediaFiles.length > 0 && (
              <section>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  Media Files ({mediaFiles.length})
                </h3>
                <MediaFileList
                  mediaFiles={mediaFiles}
                  readOnly={true}
                />
              </section>
            )}

            {}
            {project.notes && (
              <section>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  Notes
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{project.notes}</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
