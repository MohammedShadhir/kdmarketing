import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Eye, EyeOff } from 'lucide-react';

type LoginMode = 'choose' | 'sales' | 'subcontractor' | 'admin';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loginSales, loginSubContractor, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<LoginMode>('choose');
  const [salesEmail, setSalesEmail] = useState('');
  const [salesPassword, setSalesPassword] = useState('');
  const [subcontractorEmail, setSubcontractorEmail] = useState('');
  const [subcontractorPassword, setSubcontractorPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSalesPassword, setShowSalesPassword] = useState(false);
  const [showSubcontractorPassword, setShowSubcontractorPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSalesLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginSales({ email: salesEmail.trim(), password: salesPassword.trim() });
      navigate('/sales/sub-contractors');
    } catch (err) {
      console.error('Sales login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubContractorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginSubContractor({ email: subcontractorEmail.trim(), password: subcontractorPassword.trim() });
      navigate('/sub-contractor/profile');
    } catch (err) {
      console.error('Subcontractor login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginSales({ email: adminEmail.trim(), password: adminPassword.trim() });
      navigate('/admin');
    } catch (err) {
      console.error('Admin login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setMode('choose');
    clearError();
    setSalesEmail('');
    setSalesPassword('');
    setSubcontractorEmail('');
    setSubcontractorPassword('');
    setAdminEmail('');
    setAdminPassword('');
    setShowSalesPassword(false);
    setShowSubcontractorPassword(false);
    setShowAdminPassword(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white shadow-lg rounded-2xl">
            <span className="text-4xl font-bold text-emerald-600">PM</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Sub-Contractor Project Manager</h1>
          <p className="text-emerald-100">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="p-8 bg-white shadow-2xl rounded-2xl">
          {mode === 'choose' && (
            <div className="space-y-4">
              <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Choose Login Type</h2>

              <button
                onClick={() => setMode('admin')}
                className="flex items-center justify-center w-full gap-3 px-6 py-4 font-semibold text-white transition-colors bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Login
              </button>

              <button
                onClick={() => setMode('sales')}
                className="flex items-center justify-center w-full gap-3 px-6 py-4 font-semibold text-white transition-colors bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Sales Login
              </button>

              <button
                onClick={() => setMode('subcontractor')}
                className="flex items-center justify-center w-full gap-3 px-6 py-4 font-semibold text-white transition-colors bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sub-Contractor Login
              </button>
            </div>
          )}

          {mode === 'sales' && (
            <div>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <h2 className="mb-6 text-2xl font-bold text-gray-800">Sales Login</h2>

              <form onSubmit={handleSalesLogin} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={salesEmail}
                    onChange={(e) => setSalesEmail(e.target.value.trim())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="admin@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showSalesPassword ? 'text' : 'password'}
                      value={salesPassword}
                      onChange={(e) => setSalesPassword(e.target.value.trim())}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSalesPassword(!showSalesPassword)}
                      className="absolute text-gray-500 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                      aria-label={showSalesPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSalesPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          )}

          {mode === 'subcontractor' && (
            <div>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <h2 className="mb-6 text-2xl font-bold text-gray-800">Sub-Contractor Login</h2>

              <form onSubmit={handleSubContractorLogin} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={subcontractorEmail}
                    onChange={(e) => setSubcontractorEmail(e.target.value.trim())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your-email@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showSubcontractorPassword ? 'text' : 'password'}
                      value={subcontractorPassword}
                      onChange={(e) => setSubcontractorPassword(e.target.value.trim())}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSubcontractorPassword(!showSubcontractorPassword)}
                      className="absolute text-gray-500 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                      aria-label={showSubcontractorPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSubcontractorPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          )}

          {mode === 'admin' && (
            <div>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <h2 className="mb-6 text-2xl font-bold text-gray-800">Admin Login</h2>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value.trim())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="admin@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value.trim())}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute text-gray-500 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                      aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 font-semibold text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="mt-6 text-sm text-center text-emerald-100">
          &copy; 2025 Sub-Contractor Project Manager
        </p>
      </div>
    </div>
  );
}