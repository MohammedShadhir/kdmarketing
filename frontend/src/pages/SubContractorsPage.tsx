import { useEffect } from 'react';
import { SubContractorsList } from '@/components/subcontractors/SubContractorsList';
import { SubContractorDetail } from '@/components/subcontractors/SubContractorDetail';
import { useSubContractorsStore } from '@/store/subcontractors.store';
import { useProjectsStore } from '@/store/projects.store';
import { useAuthStore } from '@/store/auth.store';

export function SubContractorsPage() {
  const fetchSubContractors = useSubContractorsStore((s) => s.fetchSubContractors);
  const fetchProjects = useProjectsStore((s) => s.fetchProjects);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {

    const salesUserId = user?.role === 'sales' ? user.id : undefined;
    fetchSubContractors(salesUserId);
    fetchProjects();
  }, [fetchSubContractors, fetchProjects, user]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <SubContractorsList />
      </div>

      {}
      <div className="flex-1 overflow-auto">
        <SubContractorDetail />
      </div>
    </div>
  );
}
