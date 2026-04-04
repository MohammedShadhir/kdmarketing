import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSubContractorsStore } from '@/store/subcontractors.store';

interface Props {
  onClose: () => void;
}

type FormData = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  defaultSubcontractorPercentage: number;
  defaultSalesPercentage: number;
  address: string;
  notes: string;
};

export function AddSubContractorModal({ onClose }: Props) {
  const addSubContractor = useSubContractorsStore((s) => s.addSubContractor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      defaultSubcontractorPercentage: 70,
      defaultSalesPercentage: 15,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await addSubContractor(data);
      onClose();
    } catch (error) {
      } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-200">
        {}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">Add New Sub-Contractor</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {}
        <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="input-field w-full"
                placeholder="Enter sub-contractor name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="input-field w-full"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="input-field w-full"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name
              </label>
              <input
                {...register('companyName')}
                className="input-field w-full"
                placeholder="Enter company name"
              />
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Subcontractor %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    {...register('defaultSubcontractorPercentage', { min: 0, max: 100 })}
                    className="input-field w-full pr-8"
                    placeholder="70"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Sales %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    {...register('defaultSalesPercentage', { min: 0, max: 100 })}
                    className="input-field w-full pr-8"
                    placeholder="15"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <textarea
                {...register('address')}
                rows={2}
                className="input-field w-full resize-none"
                placeholder="Enter address"
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="input-field w-full resize-none"
                placeholder="Additional notes..."
              />
            </div>

            {}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Sub-Contractor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
