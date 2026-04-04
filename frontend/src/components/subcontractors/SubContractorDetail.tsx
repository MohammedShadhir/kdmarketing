import { useState, useMemo } from 'react';
import { useSubContractorsStore } from '@/store/subcontractors.store';
import { useProjectsStore } from '@/store/projects.store';
import { getCurrentYearMonth } from '@/lib/dates';
import { calcProjectSaved, sumRows } from '@/lib/calc';
import { generatePDFReport, generateExcelReport } from '@/lib/reportGenerator';
import { generateServerReport } from '@/services/supabase';
import { MonthSummaryCards } from './MonthSummaryCards';
import { PaymentSummaryCards } from './PaymentSummaryCards';
import { ProjectsTable } from './ProjectsTable';
import { ProjectForm } from './ProjectForm';
import { Project } from '@/types/domain';

export function SubContractorDetail() {
  const selectedSubContractorId = useSubContractorsStore((s) => s.selectedSubContractorId);
  const subContractors = useSubContractorsStore((s) => s.subContractors);
  const listBySubContractor = useProjectsStore((s) => s.listBySubContractor);
  const listBySubContractorAndMonth = useProjectsStore((s) => s.listBySubContractorAndMonth);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [showMonthFilter, setShowMonthFilter] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const subContractor = subContractors.find((c) => c.id === selectedSubContractorId);

  const projects = useMemo(() => {
    if (!selectedSubContractorId) return [];
    if (showMonthFilter) {
      return listBySubContractorAndMonth(selectedSubContractorId, selectedMonth);
    }
    return listBySubContractor(selectedSubContractorId);
  }, [selectedSubContractorId, selectedMonth, showMonthFilter, listBySubContractor, listBySubContractorAndMonth]);

  const totals = useMemo(() => {
    const calculations = projects.map(calcProjectSaved);
    return sumRows(calculations);
  }, [projects]);

  if (!subContractor) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <p className="text-gray-500 text-lg">Select a sub-contractor to view details</p>
      </div>
    );
  }

  const handleAddProject = () => {
    setEditingProject(undefined);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(undefined);
  };

  const handleDownloadPDF = () => {
    if (!subContractor) return;
    generatePDFReport({
      subContractor,
      projects,
      month: selectedMonth,
      totals,
    });
  };

  const handleDownloadExcel = () => {
    if (!subContractor) return;
    generateExcelReport({
      subContractor,
      projects,
      month: selectedMonth,
      totals,
    });
  };

  const handleDownloadServerCSV = async () => {
    if (!subContractor) return;
    setIsGeneratingReport(true);
    try {
      await generateServerReport(subContractor.id, selectedMonth);
    } catch (error) {
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {}
      <div className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">{subContractor.name}</h1>
            {subContractor.companyName && (
              <p className="text-emerald-100 text-lg mb-3">{subContractor.companyName}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-emerald-50 text-xs sm:text-sm">
              {subContractor.email && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{subContractor.email}</span>
                </span>
              )}
              {subContractor.phone && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="truncate">{subContractor.phone}</span>
                </span>
              )}
              {subContractor.address && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{subContractor.address}</span>
                </span>
              )}
            </div>
            {(subContractor.defaultSubcontractorPercentage !== undefined || subContractor.defaultSalesPercentage !== undefined) && (
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-emerald-100 text-sm">
                {subContractor.defaultSubcontractorPercentage !== undefined && (
                  <span className="bg-emerald-800/40 px-3 py-1 rounded-full">
                    Default Subcontractor: {subContractor.defaultSubcontractorPercentage}%
                  </span>
                )}
                {subContractor.defaultSalesPercentage !== undefined && (
                  <span className="bg-emerald-800/40 px-3 py-1 rounded-full">
                    Default Sales: {subContractor.defaultSalesPercentage}%
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-right text-emerald-50 text-sm">
            <div className="font-medium">Last Updated</div>
            <div className="text-xs mt-1">{new Date(subContractor.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
        {subContractor.notes && (
          <div className="mt-3 p-3 bg-emerald-800/30 rounded-lg text-sm text-emerald-50">
            <span className="font-semibold">Notes:</span> {subContractor.notes}
          </div>
        )}
      </div>

      {}
      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1 sm:flex-initial">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="monthFilter"
                checked={showMonthFilter}
                onChange={(e) => setShowMonthFilter(e.target.checked)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded transition-all duration-200"
              />
              <label htmlFor="monthFilter" className="text-sm font-medium text-gray-700 cursor-pointer">
                Filter by month
              </label>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadPDF}
              className="btn-secondary flex items-center justify-center gap-2"
              title="Download PDF Report (Client-side)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              className="btn-secondary flex items-center justify-center gap-2"
              title="Download Excel Report (Client-side)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={handleDownloadServerCSV}
              disabled={isGeneratingReport}
              className="btn-secondary flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              title="Download CSV Report (Server-side - more reliable)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
              {isGeneratingReport ? 'Generating...' : 'CSV'}
            </button>
            <button
              onClick={handleAddProject}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Project
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50" style={{ minHeight: 0 }}>
        {}
        <div className="p-4 sm:p-6">
          <MonthSummaryCards projectCount={projects.length} totals={totals} />
        </div>

        {}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <PaymentSummaryCards projects={projects} totals={totals} />
        </div>

        {}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        {projects.length === 0 ? (
          <div className="card text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 font-medium">No projects found</p>
            <p className="text-gray-500 text-sm mt-1">Add your first project to get started</p>
          </div>
        ) : (
          <ProjectsTable projects={projects} onEdit={handleEditProject} />
        )}
        </div>
      </div>

      {}
      {isFormOpen && (
        <ProjectForm
          subContractorId={subContractor.id}
          project={editingProject}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
