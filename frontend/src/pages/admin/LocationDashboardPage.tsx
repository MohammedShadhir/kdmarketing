import { useEffect, useState } from 'react';
import { MapPin, RefreshCw, Filter, Calendar } from 'lucide-react';
import { LocationMap, OnlineStatusBadge } from '@/components/location';
import { useLocationStore } from '@/store/location.store';
import { useGeofenceStore } from '@/store/geofence.store';

type FilterStatus = 'all' | 'online' | 'offline';

export function LocationDashboardPage() {
  const {
    subcontractorLocations,
    selectedSubcontractorId,
    selectedTrail,
    selectedDate,
    loading,
    fetchSubcontractorLocations,
    setSelectedSubcontractor,
    setSelectedDate,
    startAutoRefresh,
    stopAutoRefresh,
  } = useLocationStore();

  const { geofences, fetchGeofencesWithProjects } = useGeofenceStore();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchSubcontractorLocations();
    fetchGeofencesWithProjects();
    startAutoRefresh(30000);

    return () => {
      stopAutoRefresh();
    };
  }, []);

  const filteredSubcontractors = subcontractorLocations.filter((s) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'online') return s.isOnline;
    return !s.isOnline;
  });

  const onlineCount = subcontractorLocations.filter((s) => s.isOnline).length;
  const offlineCount = subcontractorLocations.length - onlineCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Location Tracking</h1>
            <p className="text-gray-600 mt-1">
              Monitor subcontractor locations in real-time
            </p>
          </div>
          <button
            onClick={() => fetchSubcontractorLocations()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500">Total Tracked</div>
            <div className="text-2xl font-bold text-gray-900">
              {subcontractorLocations.length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500">Online Now</div>
            <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500">Offline</div>
            <div className="text-2xl font-bold text-gray-400">{offlineCount}</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-320px)]">
          <div className="col-span-12 lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Filter</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({subcontractorLocations.length})
                </button>
                <button
                  onClick={() => setFilterStatus('online')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filterStatus === 'online'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Online ({onlineCount})
                </button>
                <button
                  onClick={() => setFilterStatus('offline')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filterStatus === 'offline'
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Offline ({offlineCount})
                </button>
              </div>
            </div>

            {selectedSubcontractorId && (
              <div className="p-4 border-b bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">View Trail</span>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setSelectedSubcontractor(null)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear selection
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {filteredSubcontractors.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No subcontractors found
                </div>
              ) : (
                filteredSubcontractors.map((sub) => (
                  <button
                    key={sub.subcontractorId}
                    onClick={() => setSelectedSubcontractor(sub.subcontractorId)}
                    className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${
                      selectedSubcontractorId === sub.subcontractorId
                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{sub.name}</span>
                      <OnlineStatusBadge lastSeenAt={sub.lastSeenAt} />
                    </div>
                    {sub.companyName && (
                      <span className="text-sm text-gray-500">{sub.companyName}</span>
                    )}
                    {!sub.lastKnownLat && (
                      <span className="text-xs text-gray-400 block mt-1">
                        No location data
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9 bg-white rounded-xl shadow-lg overflow-hidden">
            {filteredSubcontractors.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No location data available</p>
                </div>
              </div>
            ) : (
              <LocationMap
                subcontractors={filteredSubcontractors}
                selectedSubcontractorId={selectedSubcontractorId}
                onSubcontractorSelect={setSelectedSubcontractor}
                geofences={geofences}
                trail={selectedTrail}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
