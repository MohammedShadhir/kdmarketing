import { useState } from 'react';
import { UserPlus, Users, Briefcase, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useSubContractorsStore } from '@/store/subcontractors.store';
import { useEffect } from 'react';
import { AddSubContractorModal } from '@/components/subcontractors/AddSubContractorModal';

type TabType = 'sales' | 'subcontractor';

interface CreateUserForm {
  email: string;
  password: string;
  name: string;
  role: 'sales' | 'admin';
}

interface SetPasswordForm {
  subcontractorId: string;
  email: string;
  password: string;
}

export function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<TabType>('sales');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddSubContractorModal, setShowAddSubContractorModal] = useState(false);

  const { subContractors, fetchSubContractors } = useSubContractorsStore();

  const [salesForm, setSalesForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    name: '',
    role: 'sales'
  });

  const [scForm, setScForm] = useState<SetPasswordForm>({
    subcontractorId: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchSubContractors();
  }, [fetchSubContractors]);

  const resetMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCreateSalesUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const { data, error } = await supabase.functions.invoke('auth-create-user', {
        body: {
          email: salesForm.email,
          password: salesForm.password,
          name: salesForm.name,
          role: salesForm.role,
          userType: 'sales'
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSuccessMessage(`✅ Sales user created successfully! Email: ${salesForm.email}`);
      setSalesForm({ email: '', password: '', name: '', role: 'sales' });
    } catch (error: any) {
      setErrorMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetSubcontractorPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const { data, error } = await supabase.functions.invoke('auth-create-user', {
        body: {
          email: scForm.email,
          password: scForm.password,
          subcontractorId: scForm.subcontractorId,
          userType: 'subcontractor'
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSuccessMessage(`✅ Sub-contractor password set successfully! Email: ${scForm.email}`);
      setScForm({ subcontractorId: '', email: '', password: '' });
    } catch (error: any) {
      setErrorMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcontractorSelect = (id: string) => {
    const selected = subContractors.find(sc => sc.id === id);
    if (selected) {
      setScForm(prev => ({
        ...prev,
        subcontractorId: id,
        email: selected.email || ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('sales');
                resetMessages();
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'sales'
                  ? 'text-emerald-700 border-b-2 border-emerald-700 bg-emerald-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              Create Sales User
            </button>
            <button
              onClick={() => {
                setActiveTab('subcontractor');
                resetMessages();
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'subcontractor'
                  ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Set Sub-Contractor Password
            </button>
          </div>

          {}
          <div className="p-6">
            {}
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {}
            {activeTab === 'sales' && (
              <form onSubmit={handleCreateSalesUser} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={salesForm.email}
                    onChange={(e) => setSalesForm({ ...salesForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="admin@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={salesForm.password}
                      onChange={(e) => setSalesForm({ ...salesForm, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Min 8 characters"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={salesForm.name}
                    onChange={(e) => setSalesForm({ ...salesForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={salesForm.role}
                    onChange={(e) => setSalesForm({ ...salesForm, role: e.target.value as 'sales' | 'admin' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="sales">Sales</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Sales User
                    </>
                  )}
                </button>
              </form>
            )}

            {}
            {activeTab === 'subcontractor' && (
              <form onSubmit={handleSetSubcontractorPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Sub-Contractor *
                  </label>
                  <select
                    value={scForm.subcontractorId}
                    onChange={(e) => {
                      if (e.target.value === '__create_new__') {
                        setShowAddSubContractorModal(true);
                      } else {
                        handleSubcontractorSelect(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Select Sub-Contractor --</option>
                    {subContractors.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name} {sc.companyName ? `(${sc.companyName})` : ''}
                      </option>
                    ))}
                    <option value="__create_new__" className="bg-emerald-50 text-emerald-700 font-semibold">
                      + Create New Sub-Contractor
                    </option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select an existing sub-contractor or create a new one
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={scForm.email}
                    onChange={(e) => setScForm({ ...scForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contractor@company.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will update the sub-contractor's email if different
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={scForm.password}
                      onChange={(e) => setScForm({ ...scForm, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Min 8 characters"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Set Password
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Usage Instructions</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Sales Users:</strong> Create new accounts with email and password for your sales team or admins.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Sub-Contractors:</strong> You can create new sub-contractors directly from the dropdown, or create them in the Sub-Contractors page first.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Security:</strong> All passwords are encrypted using bcrypt before storage. Never share passwords via insecure channels.</span>
            </li>
          </ul>
        </div>
      </div>

      {}
      {showAddSubContractorModal && (
        <AddSubContractorModal
          onClose={() => {
            setShowAddSubContractorModal(false);
            fetchSubContractors();
          }}
        />
      )}
    </div>
  );
}
