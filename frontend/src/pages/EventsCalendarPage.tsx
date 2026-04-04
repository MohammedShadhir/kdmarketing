import { useState, useEffect } from 'react';
import { useEventsStore } from '@/store/events.store';
import { useSubContractorsStore } from '@/store/subcontractors.store';
import { useGHLAccountsStore } from '@/store/ghlAccounts.store';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

export function EventsCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedSubContractorId, setSelectedSubContractorId] = useState<string>('');

  const events = useEventsStore((s) => s.events);
  const loading = useEventsStore((s) => s.loading);
  const error = useEventsStore((s) => s.error);
  const fetchEvents = useEventsStore((s) => s.fetchEvents);
  const listBySubContractor = useEventsStore((s) => s.listBySubContractor);

  const subContractors = useSubContractorsStore((s) => s.subContractors);

  const selectedAccount = useGHLAccountsStore((s) => s.selectedAccount);
  const fetchAccounts = useGHLAccountsStore((s) => s.fetchAccounts);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (selectedAccount) {
      const start = startOfMonth(selectedMonth).toISOString();
      const end = endOfMonth(selectedMonth).toISOString();
      const calendarId = selectedAccount.calendarId;
      fetchEvents(start, end, calendarId, selectedAccount.locationId);
    }
  }, [selectedMonth, selectedAccount, fetchEvents]);

  const filteredEvents = selectedSubContractorId
    ? listBySubContractor(selectedSubContractorId)
    : events;

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  };

  const confirmedEvents = filteredEvents.filter((e) => e.status === 'CONFIRMED');
  const tentativeEvents = filteredEvents.filter((e) => e.status === 'TENTATIVE');
  const cancelledEvents = filteredEvents.filter((e) => e.status === 'CANCELLED');

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Appointments Calendar</h1>
          <p className="text-sm sm:text-base text-gray-600">View and manage appointments from GoHighLevel</p>
        </div>

        {}
        {!import.meta.env.VITE_GHL_CALENDAR_ID && (
          <div className="card p-6 mb-6 border-l-4 border-l-yellow-500 bg-yellow-50">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-yellow-900 mb-1">Calendar ID Not Configured</p>
                <p className="text-sm text-yellow-800">
                  To create appointments, you need to set <code className="bg-yellow-200 px-1 py-0.5 rounded">VITE_GHL_CALENDAR_ID</code> in your <code className="bg-yellow-200 px-1 py-0.5 rounded">.env</code> file.
                  Get this from your GoHighLevel account: Settings → Calendars → Copy Calendar ID
                </p>
              </div>
            </div>
          </div>
        )}

        {}
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Client
              </label>
              <select
                value={selectedSubContractorId}
                onChange={(e) => setSelectedSubContractorId(e.target.value)}
                className="input-field w-full"
              >
                <option value="">All Sub-Contractors</option>
                {subContractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Actions
              </label>
              <button
                onClick={() => {
                  const start = startOfMonth(selectedMonth).toISOString();
                  const end = endOfMonth(selectedMonth).toISOString();
                  fetchEvents(start, end);
                }}
                disabled={loading}
                className="btn-primary"
              >
                🔄 Refresh Appointments
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <button
              onClick={handlePrevMonth}
              className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center order-2 sm:order-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="text-center order-1 sm:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {format(selectedMonth, 'MMMM yyyy')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'appointment' : 'appointments'}
              </p>
            </div>

            <button
              onClick={handleNextMonth}
              className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center order-3"
            >
              Next
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {}
        {error && (
          <div className="card p-6 mb-6 border-l-4 border-l-red-500 bg-red-50">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900 mb-1">Error Loading Appointments</p>
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={() => {
                    const start = startOfMonth(selectedMonth).toISOString();
                    const end = endOfMonth(selectedMonth).toISOString();
                    fetchEvents(start, end);
                  }}
                  className="mt-2 text-red-600 underline hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {}
        {loading && (
          <div className="card p-12 text-center mb-6">
            <div className="inline-block w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading appointments from GoHighLevel...</p>
          </div>
        )}

        {}
        {!loading && (
          <div className="space-y-6">
            {}
            {confirmedEvents.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Confirmed ({confirmedEvents.length})
                </h3>
                <div className="space-y-3">
                  {confirmedEvents.map((event) => {
                    const client = subContractors.find((c) => c.id === event.subContractorId);
                    return (
                      <div
                        key={event.id}
                        className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              👤 {client?.name || 'Unknown Sub-Contractor'}
                            </p>
                            <p className="text-sm text-gray-600">
                              📅 {format(new Date(event.start), 'PPp')}
                            </p>
                            {event.location && (
                              <p className="text-sm text-gray-600">
                                📍 {event.location}
                              </p>
                            )}
                            {event.notes && (
                              <p className="text-sm text-gray-500 mt-2">{event.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {}
            {tentativeEvents.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  Tentative ({tentativeEvents.length})
                </h3>
                <div className="space-y-3">
                  {tentativeEvents.map((event) => {
                    const client = subContractors.find((c) => c.id === event.subContractorId);
                    return (
                      <div
                        key={event.id}
                        className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              👤 {client?.name || 'Unknown Sub-Contractor'}
                            </p>
                            <p className="text-sm text-gray-600">
                              📅 {format(new Date(event.start), 'PPp')}
                            </p>
                            {event.location && (
                              <p className="text-sm text-gray-600">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {}
            {cancelledEvents.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Cancelled ({cancelledEvents.length})
                </h3>
                <div className="space-y-3">
                  {cancelledEvents.map((event) => {
                    const client = subContractors.find((c) => c.id === event.subContractorId);
                    return (
                      <div
                        key={event.id}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg opacity-75"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 line-through">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              👤 {client?.name || 'Unknown Sub-Contractor'}
                            </p>
                            <p className="text-sm text-gray-600">
                              📅 {format(new Date(event.start), 'PPp')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {}
            {filteredEvents.length === 0 && !loading && (
              <div className="card text-center py-16">
                <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 font-semibold text-lg">No appointments found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {selectedSubContractorId
                    ? 'This client has no appointments for the selected month'
                    : 'No appointments scheduled for this month'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
