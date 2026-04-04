import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { SubContractor } from '@/types/domain';

interface Props {
  subContractor: SubContractor;
  onClose: () => void;
  onSave: (updates: Partial<SubContractor> & { password?: string }) => Promise<void>;
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
  password: string;
};

export function EditSubContractorModal({ subContractor, onClose, onSave }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: subContractor.name,
      email: subContractor.email || '',
      phone: subContractor.phone || '',
      companyName: subContractor.companyName || '',
      defaultSubcontractorPercentage: subContractor.defaultSubcontractorPercentage || 70,
      defaultSalesPercentage: subContractor.defaultSalesPercentage || 15,
      address: subContractor.address || '',
      notes: subContractor.notes || '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const updates: Partial<SubContractor> & { password?: string } = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        defaultSubcontractorPercentage: data.defaultSubcontractorPercentage,
        defaultSalesPercentage: data.defaultSalesPercentage,
        address: data.address,
        notes: data.notes,
      };
      if (data.password && data.password.trim() !== '') {
        updates.password = data.password;
      }
      await onSave(updates);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-200">
        {}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">Edit Sub-Contractor</h2>
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="input-field"
                placeholder="Enter name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="input-field"
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="input-field"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="input-field pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                {...register('companyName')}
                className="input-field"
                placeholder="ABC Construction Co."
              />
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Subcontractor %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  {...register('defaultSubcontractorPercentage', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be at least 0' },
                    max: { value: 100, message: 'Cannot exceed 100' },
                  })}
                  className="input-field"
                  placeholder="70"
                />
                {errors.defaultSubcontractorPercentage && (
                  <p className="text-red-500 text-xs mt-1">{errors.defaultSubcontractorPercentage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Sales %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  {...register('defaultSalesPercentage', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be at least 0' },
                    max: { value: 100, message: 'Cannot exceed 100' },
                  })}
                  className="input-field"
                  placeholder="15"
                />
                {errors.defaultSalesPercentage && (
                  <p className="text-red-500 text-xs mt-1">{errors.defaultSalesPercentage.message}</p>
                )}
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                {...register('address')}
                className="input-field"
                placeholder="123 Main St, City, State, ZIP"
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
                className="input-field resize-none"
                placeholder="Additional notes or comments"
              />
            </div>
          </div>

          {}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:flex-1 order-1 sm:order-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
