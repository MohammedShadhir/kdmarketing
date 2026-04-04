import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/Card';
import { mockSubContractors, mockProjects } from '../data/mockData';

export const SubContractorMonthPage: React.FC = () => {
  const { subContractorId } = useParams();
  const navigate = useNavigate();

  const subContractor = mockSubContractors.find((c) => c.id === subContractorId);
  const projects = mockProjects.filter((p) => p.subContractorId === subContractorId);

  const totalRevenue = projects.reduce((sum, p) => sum + p.quotedBudget, 0);
  const totalExpense = projects.reduce((sum, p) => sum + p.actualProjectCost, 0);
  const totalMargin = totalRevenue - totalExpense;

  if (!subContractor) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Sub-Contractor not found</h2>
          <Button onClick={() => navigate('/sub-contractors')}>Back to Sub-Contractors</Button>
        </div>
      </PageContainer>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  return (
    <PageContainer>
      <Link
        to="/sub-contractors"
        className="inline-flex items-center text-sm text-gray-600 hover:text-emerald-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Sub-Contractors
      </Link>

      <PageHeader
        title={subContractor.displayName}
        subtitle="October 2025"
        action={
          <Button onClick={() => navigate(`/calendar?subContractorId=${subContractorId}`)}>
            <Calendar className="w-4 h-4 mr-2" />
            Open Calendar
          </Button>
        }
      />

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Projects" value={projects.length} subtext="+3 this month" trend="up" />
        <StatCard
          label="Revenue"
          value={formatCurrency(totalRevenue)}
          subtext="+12%"
          trend="up"
        />
        <StatCard
          label="Expense"
          value={formatCurrency(totalExpense)}
          subtext="+8%"
          trend="up"
        />
        <StatCard
          label="Margin"
          value={formatCurrency(totalMargin)}
          subtext="+15%"
          trend="up"
        />
      </div>

      {}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-950">Projects</h3>
        <Button onClick={() => alert('Add Project - Mock Mode')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No projects for October 2025</h3>
          <Button onClick={() => alert('Add Project - Mock Mode')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Project
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Quoted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Actual
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Sub %
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Sales %
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Margin
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => {
                const revenue = project.quotedBudget;
                const expense = project.actualProjectCost;
                const subCut = revenue * (project.subcontractorPct / 100);
                const salesComm = revenue * (project.salespersonPct / 100);
                const margin = revenue - expense - subCut - salesComm;

                return (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-950">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                      {formatCurrency(revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                      {formatCurrency(expense)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                      {project.subcontractorPct}%
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                      {project.salespersonPct}%
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-right font-medium ${
                        margin >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(margin)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => alert('Edit - Mock Mode')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => alert('Delete - Mock Mode')}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
};
