import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Calculator, Calendar, User, Menu, X, LogOut, Briefcase, Settings, UserCheck, MapPin, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { GHLAccountSelector } from './GHLAccountSelector';
import { supabase } from '@/services/supabase';
import { useCityStore } from '@/store/city.store';
import { locations, MainLocation } from '@/data/locations';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const [cities, setCities] = useState<string[]>([]);
  const { selectedCity, setSelectedCity } = useCityStore();

  const adminNavLinks = [
    { path: '/admin', label: 'Dashboard', icon: Briefcase },
    { path: '/admin/location-tracking', label: 'Location', icon: MapPin },
    { path: '/admin/notifications', label: 'Alerts', icon: Bell },
    { path: '/admin/user-management', label: 'Users', icon: Settings },
    { path: '/admin/sales-assignments', label: 'Assignments', icon: UserCheck },
    { path: '/admin/profile', label: 'Profile', icon: User },
  ];

  const salesNavLinks = [
    { path: '/sales/sub-contractors', label: 'Sub-Contractors', icon: Users },
    { path: '/admin/location-tracking', label: 'Location', icon: MapPin },
    { path: '/sales/calculator', label: 'Calculator', icon: Calculator },
    { path: '/sales/calendar', label: 'Calendar', icon: Calendar },
    { path: '/sales/profile', label: 'Profile', icon: User },
  ];

  const subcontractorNavLinks = [
    { path: '/sub-contractor/profile', label: 'Profile', icon: User },
    { path: '/sub-contractor/my-projects', label: 'My Projects', icon: Briefcase },
    { path: '/sub-contractor/schedule', label: 'Schedule', icon: Calendar },
  ];

  const navLinks =
    user?.role === 'admin' ? adminNavLinks :
      user?.role === 'sales' ? salesNavLinks :
        user?.role === 'subcontractor' ? subcontractorNavLinks :
          [];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (user?.role !== 'subcontractor') return;
    if (!user?.id) return; // or subcontractor_id

    const fetchCities = async () => {
      const { data, error } = await supabase.functions.invoke(
        'get-subcontractor-cities',
        {
          body: {
            subcontractor_id: user.id,
          },
        }
      );

      console.log('Fetched cities:', data?.cities);

      if (error) {
        console.error(error);
      } else {
        setCities(data?.cities || []);
      }
    };

    fetchCities();
  }, [user]);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full">
          <div className="flex items-center h-16 px-4 sm:px-6">
            { }
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-700">
                  <span className="text-lg font-bold text-white">PM</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold sm:text-base text-emerald-700">Sub-Contractor</span>
                  <span className="text-xs font-semibold sm:text-sm text-emerald-600">Project Manager</span>
                </div>
              </Link>
            </div>

            { }
            <div className="items-center justify-center flex-1 hidden gap-1 px-8 md:flex">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(path)
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-700 hover:text-gray-950 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>

            { }
            <div className="items-center flex-shrink-0 hidden gap-3 md:flex">
              { }
              {user?.role === 'sales' && <GHLAccountSelector />}
              {user?.role === 'subcontractor' && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      const mainLocation = e.target.value as MainLocation; // Type-safe
                      setSelectedCity(mainLocation);

                      // Automatically get all sub-locations for project filtering
                      const subLocations = locations[mainLocation] || [];
                      // Store subLocations in a store/context to filter projects
                      console.log("Sub-locations to filter projects:", subLocations);
                    }}
                    disabled={cities.length === 0}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="">All Cities</option>
                    {Object.keys(locations).map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-center rounded-full w-7 h-7 bg-emerald-600">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            { }
            <div className="flex justify-end flex-1 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 transition-colors rounded-lg text-emerald-700 hover:bg-emerald-50"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      { }
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 duration-200 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={handleNavClick}
        />
      )}

      { }
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[calc(100%-48px)] sm:w-[280px] max-w-[320px] bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        { }
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-emerald-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm">
                <span className="text-lg font-bold text-white">PM</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold text-white">Sub-Contractor</span>
                <span className="text-xs font-medium text-emerald-100">Project Manager</span>
              </div>
            </div>
            <button
              onClick={handleNavClick}
              className="p-2 transition-colors rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          { }
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{user?.name}</div>
              <div className="text-xs capitalize text-emerald-100">{user?.role}</div>
            </div>
          </div>
        </div>

        { }
        <div className="p-4">
          <nav className="space-y-2">
            {user?.role === 'subcontractor' && Object.keys(locations).length > 0 && (
              <div className="mb-4">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="">All Cities</option>
                  {Object.keys(locations).map((mainCity) => (
                    <option key={mainCity} value={mainCity}>
                      {mainCity}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200',
                  isActive(path)
                    ? 'text-emerald-700 bg-emerald-50 shadow-sm'
                    : 'text-gray-700 hover:text-emerald-700 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        { }
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              handleNavClick();
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors mb-3"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <div className="text-xs text-center text-gray-500">
            <p className="font-medium">Sub-Contractor PM</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};
