import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    default_sales_commission?: number;
  };
  onClose: () => void;
  onSave: (updates: { name?: string; email?: string; is_active?: boolean; password?: string; default_sales_commission?: number }) => Promise<void>;
}

type FormData = {
  name: string;
  email: string;
  is_active: boolean;
  password: string;
  default_sales_commission: number;
};

export function EditSalesUserModal({ user, onClose, onSave }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: user.name,
      email: user.email,
      is_active: user.is_active,
      password: '',
      default_sales_commission: user.default_sales_commission ?? 15,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const updates: { name?: string; email?: string; is_active?: boolean; password?: string; default_sales_commission?: number } = {
        name: data.name,
        email: data.email,
        is_active: data.is_active,
        default_sales_commission: data.default_sales_commission,
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
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-200">
        {}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">Edit Sales User</h2>
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
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
                Default Sales Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register('default_sales_commission', {
                  required: 'Sales commission is required',
                  min: { value: 0, message: 'Must be at least 0%' },
                  max: { value: 100, message: 'Cannot exceed 100%' },
                  valueAsNumber: true,
                })}
                className="input-field"
                placeholder="15"
              />
              {errors.default_sales_commission && (
                <p className="text-red-500 text-xs mt-1">{errors.default_sales_commission.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                This commission will auto-apply when this salesperson creates a new project
              </p>
            </div>

            {}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded transition-all duration-200"
                />
                <span className="text-sm font-semibold text-gray-700">Active User</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Inactive users cannot log in
              </p>
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
