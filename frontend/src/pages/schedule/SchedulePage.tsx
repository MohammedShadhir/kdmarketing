import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Briefcase } from 'lucide-react';
import { useScheduleAuthStore } from '@/store/scheduleAuth.store';
import { SalesScheduleView } from './SalesScheduleView';
import { SubContractorScheduleView } from './SubContractorScheduleView';

export function SchedulePage() {
  const navigate = useNavigate();
  const user = useScheduleAuthStore((s) => s.user);
  const logout = useScheduleAuthStore((s) => s.logout);
  const initialized = useScheduleAuthStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) {
      useScheduleAuthStore.getState().initialize();
    }
  }, [initialized]);

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Project Schedule</h1>
                <p className="text-xs text-gray-600">
                  {user.role === 'sales' ? 'Sales View' : 'Sub-Contractor View'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.reload();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {}
        {user.role === 'sales' ? (
          <SalesScheduleView userId={user.id} />
        ) : (
          <SubContractorScheduleView subcontractorId={user.subcontractorId!} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl mb-6 shadow-xl">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Schedule</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View and manage your project schedules. Login to access your personalized schedule view.
          </p>
        </div>

        {}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 max-w-2xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Your Schedule</h2>
            <p className="text-gray-600">Choose your login type</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/schedule/sales-login')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Users className="w-8 h-8" />
              <span className="text-lg">Sales Login</span>
              <span className="text-xs text-emerald-100">For sales team members</span>
            </button>

            <button
              onClick={() => navigate('/schedule/subcontractor-login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Briefcase className="w-8 h-8" />
              <span className="text-lg">Sub-Contractor Login</span>
              <span className="text-xs text-blue-100">For sub-contractors</span>
            </button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">For Sales</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>View all projects you created</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Modify project dates and schedules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Change visibility settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Add media files to projects</span>
              </li>
            </ul>
          </div>

          {}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">For Sub-Contractors</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>View your assigned projects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Check upcoming schedules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Add comments to projects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Upload media files</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
