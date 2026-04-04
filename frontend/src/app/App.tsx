import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navigation } from '@/components/layout/Navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { SubContractorsPage } from '@/pages/SubContractorsPage';
import { SubContractorMonthPage } from '@/pages/SubContractorMonthPage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { EventsCalendarPage } from '@/pages/EventsCalendarPage';
import { TestPage } from '@/pages/TestPage';
import { SubContractorDashboard } from '@/pages/subcontractor/SubContractorDashboard';
import { SubContractorProfilePage } from '@/pages/subcontractor/SubContractorProfilePage';
import { SubContractorSchedulePage } from '@/pages/subcontractor/SubContractorSchedulePage';
import { AdminPanelPage } from '@/pages/AdminPanelPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { SalesAssignmentsPage } from '@/pages/admin/SalesAssignmentsPage';
import { ProfilePage } from '@/pages/admin/ProfilePage';
import { LocationDashboardPage } from '@/pages/admin/LocationDashboardPage';
import { GeofenceManagementPage } from '@/pages/admin/GeofenceManagementPage';
import { NotificationsPage } from '@/pages/admin/NotificationsPage';
import { SchedulePage } from '@/pages/schedule/SchedulePage';
import { ScheduleSalesLoginPage } from '@/pages/schedule/ScheduleSalesLoginPage';
import { ScheduleSubContractorLoginPage } from '@/pages/schedule/ScheduleSubContractorLoginPage';
import { useAuthStore } from '@/store/auth.store';
import { LocationTracker } from '@/components/location';

function ProtectedLayout() {
  const user = useAuthStore((s) => s.user);
  const isSubcontractor = user?.role === 'subcontractor' && user?.subContractorId;

  return (
    <>
      <Navigation />
      {isSubcontractor && (
        <LocationTracker
          subcontractorId={user.subContractorId!}
          intervalMinutes={3}
          enabled={true}
        />
      )}
      <Outlet />
    </>
  );
}

useAuthStore.getState().initialize();

export function App() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('logout') === 'true') {
      logout();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [logout]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {}
          <Route path="/login" element={<LoginPage />} />

          {}
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/schedule/sales-login" element={<ScheduleSalesLoginPage />} />
          <Route path="/schedule/subcontractor-login" element={<ScheduleSubContractorLoginPage />} />

          {}
          <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
            {}
            <Route
              path="/"
              element={(() => {
                if (user?.role === 'subcontractor') {
                  return <Navigate to="/sub-contractor/profile" replace />;
                } else if (user?.role === 'admin') {
                  return <Navigate to="/admin" replace />;
                } else if (user?.role === 'sales') {
                  return <Navigate to="/sales/sub-contractors" replace />;
                } else {
                  return <Navigate to="/login" replace />;
                }
              })()}
            />

            {}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/admin/user-management" element={<UserManagementPage />} />
            <Route path="/admin/sales-assignments" element={<SalesAssignmentsPage />} />
            <Route path="/admin/create-user" element={<AdminPanelPage />} />
            <Route path="/admin/location-tracking" element={<LocationDashboardPage />} />
            <Route path="/admin/geofences" element={<GeofenceManagementPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />

            {}
            <Route path="/sales/sub-contractors" element={<SubContractorsPage />} />
            <Route path="/sales/sub-contractors/:subContractorId" element={<SubContractorMonthPage />} />
            <Route path="/sales/calculator" element={<CalculatorPage />} />
            <Route path="/sales/calendar" element={<CalendarPage />} />
            <Route path="/sales/appointments" element={<EventsCalendarPage />} />
            <Route path="/sales/ghl-accounts" element={<TestPage />} />
            <Route path="/sales/profile" element={<ProfilePage />} />

            {}
            <Route path="/sub-contractor/profile" element={<SubContractorProfilePage />} />
            <Route path="/sub-contractor/my-projects" element={<SubContractorDashboard />} />
            <Route path="/sub-contractor/schedule" element={<SubContractorSchedulePage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
