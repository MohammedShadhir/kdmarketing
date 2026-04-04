import { useState, useMemo, useEffect } from "react";
import { useSubContractorsStore } from "@/store/subcontractors.store";
import { useProjectsStore } from "@/store/projects.store";
import { getCurrentYearMonth, isDayInRange, formatCurrency } from "@/lib/dates";
import { Project } from "@/types/domain";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";

export function CalendarPage() {
  const subContractors = useSubContractorsStore((s) => s.subContractors);
  const loading = useProjectsStore((s) => s.loading);
  const error = useProjectsStore((s) => s.error);
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);
  const listBySubContractor = useProjectsStore((s) => s.listBySubContractor);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const [selectedSubContractorId, setSelectedSubContractorId] =
    useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const monthDate = parseISO(selectedMonth + "-01");
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const clientProjects = useMemo(() => {
    if (!selectedSubContractorId) return [];
    return listBySubContractor(selectedSubContractorId);
  }, [selectedSubContractorId, listBySubContractor]);

  const monthProjects = useMemo(() => {
    return clientProjects.filter((p) => {
      if (!p.startDate || !p.endDate) return false;
      const pStart = parseISO(p.startDate);
      const pEnd = parseISO(p.endDate);
      return pStart <= monthEnd && pEnd >= monthStart;
    });
  }, [clientProjects, monthStart, monthEnd]);

  const isDayBooked = (day: Date) => {
    return monthProjects.some((p) => isDayInRange(day, p.startDate, p.endDate));
  };

  const getProjectsForDay = (day: Date) => {
    return monthProjects.filter((p) =>
      isDayInRange(day, p.startDate, p.endDate)
    );
  };

  const handlePrevMonth = () => {
    const prev = subMonths(monthDate, 1);
    setSelectedMonth(format(prev, "yyyy-MM"));
  };

  const handleNextMonth = () => {
    const next = addMonths(monthDate, 1);
    setSelectedMonth(format(next, "yyyy-MM"));
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-sm sm:text-base text-gray-600">View project schedules and timeline</p>
        </div>

        {}
        {error && (
          <div className="card p-6 mb-6 border-l-4 border-l-red-500 bg-red-50">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-semibold text-red-900 mb-1">
                  Error Loading Projects
                </p>
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={() => fetchProjects()}
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
            <p className="text-gray-600">
              Loading projects...
            </p>
          </div>
        )}

        {}
        <div className="card p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Sub-Contractor *
              </label>
              <select
                value={selectedSubContractorId}
                onChange={(e) => setSelectedSubContractorId(e.target.value)}
                className="input-field w-full"
              >
                <option value="">Select a sub-contractor...</option>
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
                onClick={() => fetchProjects()}
                disabled={loading}
                className="btn-primary"
              >
                🔄 Refresh Projects
              </button>
            </div>
          </div>
        </div>

        {selectedSubContractorId && (
          <>
            {}
            <div className="card p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handlePrevMonth}
                  className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
                <div className="text-center">
                  <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
                    {format(monthDate, "MMMM yyyy")}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {monthProjects.length}{" "}
                    {monthProjects.length === 1 ? "project" : "projects"} this
                    month
                  </p>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  Next
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {}
            <div className="card p-2 sm:p-6 mb-6">
              <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center font-bold text-gray-700 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wide"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day[0]}</span>
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-3">
                {daysInMonth.map((day) => {
                  const isBooked = isDayBooked(day);
                  const dayProjects = getProjectsForDay(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] border rounded-lg sm:rounded-xl p-1.5 sm:p-3 transition-all duration-200 ${
                        isBooked
                          ? "bg-emerald-50 border-emerald-300 shadow-sm"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`text-sm sm:text-base font-bold mb-1.5 sm:mb-2 ${
                          isBooked ? "text-emerald-900" : "text-gray-700"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      {dayProjects.length > 0 && (
                        <div className="space-y-1 sm:space-y-1.5">
                          {dayProjects.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setSelectedProject(p)}
                              className="w-full text-left px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-emerald-600 text-white text-xs sm:text-sm rounded sm:rounded-lg hover:bg-emerald-700 truncate font-medium transition-all duration-200 shadow-sm hover:shadow"
                              title={p.title}
                            >
                              <span className="hidden sm:inline">{p.title}</span>
                              <span className="sm:hidden">•</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {}
            <div className="card p-4 sm:p-6 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Projects This Month
                  </h2>
                  <p className="text-sm text-gray-600">
                    All scheduled projects for {format(monthDate, "MMMM")}
                  </p>
                </div>
              </div>
              {monthProjects.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium">
                    No projects scheduled
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Projects will appear here when scheduled for this month
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {monthProjects.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-emerald-50 border-2 border-emerald-200 rounded-lg sm:rounded-xl hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer transition-all duration-200 shadow-sm hover:shadow"
                      onClick={() => setSelectedProject(p)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 text-base sm:text-lg truncate">
                            {p.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-700">
                            <svg
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="truncate">{p.startDate} to {p.endDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0 pl-13 sm:pl-0">
                        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                          Value
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-emerald-900">
                          {formatCurrency(p.projectPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {}
            {selectedProject && (
              <div className="card p-4 sm:p-6 border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Project Details
                      </h2>
                      <p className="text-sm text-gray-600">
                        Selected project information
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Project Title
                    </label>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {selectedProject.title}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Description
                    </label>
                    <div className="text-sm text-gray-700 mt-1">
                      {selectedProject.description || "No description provided"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Project Value
                    </label>
                    <div className="text-2xl font-bold text-emerald-900 mt-1">
                      {formatCurrency(selectedProject.projectPrice)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Duration
                    </label>
                    <div className="text-sm text-gray-700 mt-1 font-medium">
                      {selectedProject.startDate} to {selectedProject.endDate}
                    </div>
                  </div>
                  <div className="col-span-2 pt-4 border-t border-gray-200">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = "#/sub-contractors";
                      }}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Open in Sub-Contractors Screen
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!selectedSubContractorId && (
          <div className="card text-center py-16">
            <svg
              className="w-20 h-20 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 font-semibold text-lg">
              Select a sub-contractor to begin
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Choose a sub-contractor from the dropdown above to view their
              calendar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
