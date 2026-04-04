import { useState, useEffect, useMemo } from 'react';
import { Project, MediaFile, Payment } from '@/types/domain';
import { formatCurrency } from '@/lib/dates';
import { getProjectMedia, uploadMultipleMediaFiles, deleteMediaFile } from '@/services/supabase';
import { MediaFileList } from '@/components/projects/MediaFileList';
import { useProjectsStore } from '@/store/projects.store';
import { AddPaymentModal } from '@/components/subcontractor/AddPaymentModal';

interface Props {
  project: Project;
  onClose: () => void;
}

export function SubContractorProjectDetail({ project, onClose }: Props) {
  const updateProject = useProjectsStore((s) => s.updateProject);
  const isUnlisted = project.visibility === 'unlisted';

  const [notes, setNotes] = useState(project.notes || '');
  const [saving, setSaving] = useState(false);
  const [existingMediaFiles, setExistingMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payments, setPayments] = useState<Payment[]>(
    Array.isArray(project.payments) ? project.payments : []
  );

  useEffect(() => {
    const fetchMediaFiles = async () => {
      setLoadingMedia(true);
      try {
        const mediaFiles = await getProjectMedia(project.id);
        setExistingMediaFiles(mediaFiles);
      } catch (error) {
        console.error('Failed to fetch media files:', error);
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchMediaFiles();
  }, [project.id]);

  const allocated = useMemo(() => {
    return project.projectPrice * (project.subcontractorPercentage / 100);
  }, [project]);

  const paid = useMemo(() => {
    let total = 0;
    if (Array.isArray(project.payments)) {
      project.payments.forEach((payment) => {
        if (
          payment.paymentType === 'subcontractor_payment' ||
          payment.paymentType === 'subcontractor_check_collected'
        ) {
          total += payment.amount;
        }
      });
    }
    return total;
  }, [project]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateProject(project.id, { notes });
      alert('Notes saved successfully!');
    } catch (error) {
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadedFiles = await uploadMultipleMediaFiles(project.id, selectedFiles);
      setExistingMediaFiles((prev) => [...prev, ...uploadedFiles]);
      setSelectedFiles([]);
    } catch (error) {
      alert('Failed to upload some files. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDeleteMediaFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteMediaFile(fileId);
      setExistingMediaFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      alert('Failed to delete file');
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkComplete = async () => {
    if (!confirm('Mark this project as completed?')) return;

    setSaving(true);
    try {
      await updateProject(project.id, { status: 'Completed' });
      alert('Project marked as completed!');
      onClose();
    } catch (error) {
      alert('Failed to update project status');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPayment = async (payment: Payment) => {
    try {
      const updatedPayments = [...payments, payment];
      await updateProject(project.id, { payments: updatedPayments });
      setPayments(updatedPayments);
      setShowAddPayment(false);
      alert('Payment added successfully!');
    } catch (error) {
      alert('Failed to add payment');
    }
  };

  const handleDeletePayment = async (index: number) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      const updatedPayments = payments.filter((_, i) => i !== index);
      await updateProject(project.id, { payments: updatedPayments });
      setPayments(updatedPayments);
      alert('Payment deleted successfully!');
    } catch (error) {
      alert('Failed to delete payment');
    }
  };

  if (isUnlisted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Upcoming Project</h2>
                <p className="text-purple-100 text-sm">Limited information available</p>
              </div>
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

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Project Timeline</h3>
              <div className="space-y-2">
                {project.startDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(project.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(project.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-yellow-800">
                  Full project details will be available closer to the start date. Please check back later for more information.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
              {project.customerName && (
                <p className="text-blue-100">Customer: {project.customerName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Description */}
          {project.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
          )}

          {/* Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Project Price</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(project.projectPrice)}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Your Share ({project.subcontractorPercentage}%)</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(allocated)}</p>
            </div>

            {/* Sales Commission - Hidden */}
            <div className="bg-gray-50 p-4 rounded-lg relative">
              <p className="text-sm text-gray-600 mb-1">Sales Commission</p>
              <div className="blur-sm select-none">
                <p className="text-xl font-bold text-gray-900">{project.salesCommissionPercentage}%</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Hidden</span>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Paid to You</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(paid)}</p>
            </div>
          </div>

          {/* Amount Due & Progress Bar */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Amount Due</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(allocated - paid)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Payment Progress</p>
                <p className="text-lg font-semibold text-gray-900">
                  {allocated > 0 ? Math.round((paid / allocated) * 100) : 0}%
                </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-orange-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${allocated > 0 ? Math.min((paid / allocated) * 100, 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.startDate && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Start Date</p>
                <p className="text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
              </div>
            )}
            {project.endDate && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">End Date</p>
                <p className="text-gray-900">{new Date(project.endDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Address */}
          {project.addressLine1 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Project Address</h3>
              <div className="text-gray-600 space-y-1">
                <p>{project.addressLine1}</p>
                {project.addressLine2 && <p>{project.addressLine2}</p>}
                <p>
                  {project.city && `${project.city}, `}
                  {project.state && `${project.state} `}
                  {project.zipcode}
                </p>
              </div>
            </div>
          )}

          {/* Payment Records */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Payment Records</h3>
              <button
                onClick={() => setShowAddPayment(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Payment
              </button>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-600">No payment records yet</p>
                <p className="text-xs text-gray-500 mt-1">Add payment information to track received payments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          {payment.method || 'N/A'}
                        </span>
                        <span className="ml-2 text-xs sm:text-sm text-gray-600">{payment.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          {formatCurrency(payment.amount || 0)}
                        </span>
                        <button
                          onClick={() => handleDeletePayment(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete payment"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add notes about this project..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving || notes === project.notes}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>

          {/* Media Files */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Media Files</h3>

            {loadingMedia ? (
              <p className="text-gray-500 text-sm">Loading media files...</p>
            ) : existingMediaFiles.length > 0 ? (
              <MediaFileList mediaFiles={existingMediaFiles} onDelete={handleDeleteMediaFile} />
            ) : (
              <p className="text-gray-500 text-sm">No media files uploaded yet</p>
            )}

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload New Files
              </label>

              <input
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />

              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleUploadFiles}
                    disabled={uploadingFiles}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {uploadingFiles ? 'Uploading...' : 'Upload Files'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          {project.status !== 'Completed' && (
            <button
              onClick={handleMarkComplete}
              disabled={saving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              Mark as Completed
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

        {/* Add Payment Modal */}
        {showAddPayment && (
          <AddPaymentModal
            onClose={() => setShowAddPayment(false)}
            onSave={handleAddPayment}
            projectPrice={project.projectPrice}
          />
        )}
      </div>
    </div>
  );
}