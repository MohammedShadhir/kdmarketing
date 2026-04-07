import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Project, Payment, PaymentMethod, PaymentType, PaymentRecipient, MediaFile, ProjectVisibility } from '@/types/domain';
import { useProjectsStore } from '@/store/projects.store';
import { useSubContractorsStore } from '@/store/subcontractors.store';
import { useAuthStore } from '@/store/auth.store';
import { getContactsFromAllAccounts, Contact } from '@/services/supabaseGHL';
import { getTaxPercentageByCity, calculateTaxAmount } from '@/lib/taxUtils';
import { formatCurrency } from '@/lib/dates';
import { uploadMultipleMediaFiles, deleteMediaFile, getProjectMedia } from '@/services/supabase';
import { MediaFileList } from '@/components/projects/MediaFileList';
import { ClientAutocomplete } from '@/components/common/ClientAutocomplete';
import { v4 as uuidv4 } from 'uuid';
import { cities, locations } from '@/data/locations';
import { useCityStore } from '@/store/city.store';

interface Props {
  subContractorId: string;
  project?: Project;
  onClose: () => void;
}

type FormData = {
  title: string;
  description: string;
  customerName: string;
  customerId: string;
  projectPrice: number;
  subcontractorPercentage: number;
  salesCommissionPercentage: number;
  salesPerson: string;
  advancePaymentAmount: number;
  advancePaymentTaxPercentage: number;
  advancePaymentTaxAmount: number;
  modeOfPayment: string;
  startDate: string;
  endDate: string;
  notes: string;
  status: string;
  visibility: ProjectVisibility;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
  defaultTaxPercentage: number;
  refundAmount: number;
  refundDate: string;
  isDiscontinued: boolean;
  reviewCollected: boolean | string;
};

export function ProjectForm({ subContractorId, project, onClose }: Props) {
  const addProject = useProjectsStore((s) => s.addProject);
  const updateProject = useProjectsStore((s) => s.updateProject);
  const subContractors = useSubContractorsStore((s) => s.subContractors);
  const user = useAuthStore((s) => s.user);

  const selectedSubContractor = subContractors.find(sc => sc.id === subContractorId);

  const defaultSalesCommission = user?.default_sales_commission
    ?? selectedSubContractor?.defaultSalesPercentage
    ?? 15;

  const [customersByAccount, setCustomersByAccount] = useState<Array<{ accountName: string; locationId: string; contacts: Contact[]; totalContacts: number }>>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(50);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { selectedCity, setSelectedCity } = useCityStore();

  const [payments, setPayments] = useState<Payment[]>(
    Array.isArray(project?.payments) ? project.payments : []
  );
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Partial<Payment>>({
    amount: 0,
    method: 'Cash 💵',
    date: new Date().toISOString().split('T')[0],
    taxPercentage: 0,
    taxAmount: 0,
  });

  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingMediaFiles, setExistingMediaFiles] = useState<MediaFile[]>(project?.mediaFiles || []);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: project
      ? {
        title: project.title,
        description: project.description || '',
        customerName: project.customerName || '',
        customerId: project.customerId || '',
        projectPrice: project.projectPrice,
        subcontractorPercentage: project.subcontractorPercentage,
        salesCommissionPercentage: project.salesCommissionPercentage,
        salesPerson: project.salesPerson || '',
        advancePaymentAmount: project.advancePaymentAmount || 0,
        advancePaymentTaxPercentage: project.advancePaymentTaxPercentage || 0,
        advancePaymentTaxAmount: project.advancePaymentTaxAmount || 0,
        modeOfPayment: project.modeOfPayment || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        notes: project.notes || '',
        status: project.status || 'Active',
        visibility: project.visibility || 'public',
        addressLine1: project.addressLine1 || '',
        addressLine2: project.addressLine2 || '',
        city: project.city || '',
        state: project.state || '',
        zipcode: project.zipcode || '',
        defaultTaxPercentage: project.defaultTaxPercentage || 0,
        refundAmount: project.refundAmount || 0,
        refundDate: project.refundDate || '',
        isDiscontinued: project.isDiscontinued || false,
        reviewCollected: project.reviewCollected || false,
      }
      : {
        customerName: '',
        customerId: '',
        subcontractorPercentage: selectedSubContractor?.defaultSubcontractorPercentage || 70,
        salesCommissionPercentage: defaultSalesCommission,
        advancePaymentAmount: 0,
        advancePaymentTaxPercentage: 0,
        advancePaymentTaxAmount: 0,
        status: 'Active',
        visibility: 'public',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipcode: '',
        defaultTaxPercentage: 0,
        refundAmount: 0,
        refundDate: '',
        isDiscontinued: false,
        reviewCollected: false,
      },
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      setLoadingProgress('Connecting to GoHighLevel...');
      try {
        const response = await getContactsFromAllAccounts(
          50,
          0,
          undefined,
          false,
          (accountName, accountIndex, totalAccounts, contactCount) => {
            setLoadingProgress(`Loading ${accountName}... (${accountIndex}/${totalAccounts}) - ${contactCount} contacts`);
          }
        );
        setCustomersByAccount(response);
        const loadedCount = response.reduce((sum, acc) => sum + acc.contacts.length, 0);
        const totalCount = response.reduce((sum, acc) => sum + acc.totalContacts, 0);
        setLoadingProgress(`✓ Loaded ${loadedCount} of ${totalCount} contacts`);
      } catch (error) {
        setLoadingProgress('Error loading contacts. Please try again.');
      } finally {
        setTimeout(() => {
          setLoadingCustomers(false);
          setLoadingProgress('');
        }, 1500);
      }
    };

    fetchCustomers();
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const newLimit = currentLimit + 50;

    try {
      const response = await getContactsFromAllAccounts(
        newLimit,
        0,
        undefined,
        false,
        (accountName, accountIndex, totalAccounts, contactCount) => {
          setLoadingProgress(`Loading more from ${accountName}... (${accountIndex}/${totalAccounts}) - ${contactCount} contacts`);
        }
      );
      setCustomersByAccount(response);
      setCurrentLimit(newLimit);

      const loadedCount = response.reduce((sum, acc) => sum + acc.contacts.length, 0);
      const totalCount = response.reduce((sum, acc) => sum + acc.totalContacts, 0);
      setLoadingProgress(`✓ Loaded ${loadedCount} of ${totalCount} contacts`);
    } catch (error) {
      setLoadingProgress('Error loading more contacts.');
    } finally {
      setTimeout(() => {
        setLoadingMore(false);
        setLoadingProgress('');
      }, 1500);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setIsSearching(true);
      setLoadingProgress('Loading contacts...');
      try {
        const response = await getContactsFromAllAccounts(
          50,
          0,
          undefined,
          false,
          (accountName, accountIndex, totalAccounts) => {
            setLoadingProgress(`Loading ${accountName}... (${accountIndex}/${totalAccounts})`);
          }
        );
        setCustomersByAccount(response);
        setCurrentLimit(50);
        setLoadingProgress('');
      } catch (error) {
        setLoadingProgress('Error loading contacts.');
      } finally {
        setIsSearching(false);
      }
      return;
    }

    setIsSearching(true);
    setLoadingProgress(`Searching for "${searchQuery}"...`);

    try {
      const response = await getContactsFromAllAccounts(
        50,
        0,
        searchQuery,
        true,
        (accountName, accountIndex, totalAccounts) => {
          setLoadingProgress(`Searching ${accountName}... (${accountIndex}/${totalAccounts})`);
        }
      );
      setCustomersByAccount(response);

      const totalFound = response.reduce((sum, acc) => sum + acc.contacts.length, 0);
      setLoadingProgress(`✓ Found ${totalFound} matching contacts`);

      setTimeout(() => {
        setLoadingProgress('');
      }, 2000);
    } catch (error) {
      setLoadingProgress('Error searching contacts. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const fetchMediaFiles = async () => {
      if (project?.id) {
        setLoadingMedia(true);
        try {
          const mediaFiles = await getProjectMedia(project.id);
          setExistingMediaFiles(mediaFiles);
        } catch (error) {
          console.error('Failed to fetch media files:', error);
        } finally {
          setLoadingMedia(false);
        }
      }
    };

    fetchMediaFiles();
  }, [project?.id]);

  const handleCustomerSelect = (contact: Contact | null) => {
    if (!contact) {
      setValue('customerId', '');
      setValue('customerName', '');
      return;
    }

    setUseManualEntry(false);
    setValue('customerId', contact.id);

    const fullName = `${contact.firstName}${contact.lastName ? ' ' + contact.lastName : ''}`;
    setValue('customerName', fullName);

    if (contact.address1) {
      setValue('addressLine1', contact.address1);
    }
    if (contact.city) {
      setValue('city', contact.city);
      const taxPercentage = getTaxPercentageByCity(contact.city);
      setValue('defaultTaxPercentage', taxPercentage);
    }
    if (contact.state) {
      setValue('state', contact.state);
    }
    if (contact.postalCode) {
      setValue('zipcode', contact.postalCode);
    }
  };

  const handleManualEntry = () => {
    setUseManualEntry(true);
    setValue('customerId', '');
    setValue('customerName', '');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;
    setValue('city', city);
    const taxPercentage = getTaxPercentageByCity(city);
    setValue('defaultTaxPercentage', taxPercentage);

    if (showAddPayment || editingPaymentIndex !== null) {
      setCurrentPayment(prev => ({
        ...prev,
        taxPercentage,
        taxAmount: calculateTaxAmount(prev.amount || 0, taxPercentage),
      }));
    }
  };

  const handleAddPaymentClick = () => {
    const defaultTax = watch('defaultTaxPercentage') || 0;
    setCurrentPayment({
      id: crypto.randomUUID(),
      amount: 0,
      method: 'Cash 💵',
      date: new Date().toISOString().split('T')[0],
      taxPercentage: defaultTax,
      taxAmount: 0,
      paymentType: 'client_payment',
      paidTo: undefined,
      paidToSalesPerson: '',
      notes: '',
    });
    setShowAddPayment(true);
  };

  const handleEditPayment = (index: number) => {
    setCurrentPayment(payments[index]);
    setEditingPaymentIndex(index);
    setShowAddPayment(true);
  };

  const handleDeletePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handlePaymentAmountChange = (amount: number) => {
    const taxAmount = calculateTaxAmount(amount, currentPayment.taxPercentage || 0);
    setCurrentPayment(prev => ({
      ...prev,
      amount,
      taxAmount,
    }));
  };

  const handlePaymentTaxChange = (taxPercentage: number) => {
    const taxAmount = calculateTaxAmount(currentPayment.amount || 0, taxPercentage);
    setCurrentPayment(prev => ({
      ...prev,
      taxPercentage,
      taxAmount,
    }));
  };

  const handleSavePayment = () => {
    if (!currentPayment.amount || currentPayment.amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (!currentPayment.paymentType) {
      alert('Please select payment type');
      return;
    }

    if (currentPayment.paymentType !== 'client_payment' && !currentPayment.paidTo) {
      alert('Please select who received the payment');
      return;
    }

    if (currentPayment.paymentType === 'sales_payment' && !currentPayment.paidToSalesPerson) {
      alert('Please enter the sales person name');
      return;
    }

    const payment: Payment = {
      id: currentPayment.id || uuidv4(),
      amount: currentPayment.amount!,
      method: currentPayment.method as PaymentMethod,
      date: currentPayment.date!,
      taxPercentage: currentPayment.taxPercentage!,
      taxAmount: currentPayment.taxAmount!,
      paymentType: currentPayment.paymentType as PaymentType,
      paidTo: currentPayment.paidTo,
      paidToSalesPerson: currentPayment.paidToSalesPerson,
      notes: currentPayment.notes,
    };

    if (editingPaymentIndex !== null) {
      const updated = [...payments];
      updated[editingPaymentIndex] = payment;
      setPayments(updated);
      setEditingPaymentIndex(null);
    } else {
      setPayments([...payments, payment]);
    }

    setShowAddPayment(false);
    setCurrentPayment({
      amount: 0,
      method: 'Cash 💵',
      date: new Date().toISOString().split('T')[0],
      taxPercentage: watch('defaultTaxPercentage') || 0,
      taxAmount: 0,
    });
  };

  const handleCancelPayment = () => {
    setShowAddPayment(false);
    setEditingPaymentIndex(null);
    setCurrentPayment({
      amount: 0,
      method: 'Cash 💵',
      date: new Date().toISOString().split('T')[0],
      taxPercentage: watch('defaultTaxPercentage') || 0,
      taxAmount: 0,
    });
  };

  const totalPaymentsReceived = Array.isArray(payments) ? payments.reduce((sum, p) => sum + p.amount, 0) : 0;
  const totalTaxCollected = Array.isArray(payments) ? payments.reduce((sum, p) => sum + p.taxAmount, 0) : 0;
  const projectPrice = watch('projectPrice') || 0;
  const remainingBalance = projectPrice - totalPaymentsReceived;

  const onSubmit = async (data: FormData) => {
    try {
      const projectData = {
        ...data,
        refundAmount: data.isDiscontinued && data.refundAmount ? Number(data.refundAmount) : 0,
        refundDate: data.isDiscontinued && data.refundDate ? data.refundDate : undefined,
        isDiscontinued: Boolean(data.isDiscontinued),
        reviewCollected: data.reviewCollected === true || data.reviewCollected === 'true',
        payments,
        totalPaymentsReceived,
        totalTaxCollected,
        remainingBalance,
        subContractorId,
      };

      let projectId: string;
      if (project) {
        await updateProject(project.id, projectData);
        projectId = project.id;
      } else {
        const newProject = await addProject(projectData);
        projectId = newProject.id;
      }

      if (selectedFiles.length > 0) {
        await handleUploadFiles(projectId);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleUploadFiles = async (projectId: string) => {
    if (selectedFiles.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadedFiles = await uploadMultipleMediaFiles(projectId, selectedFiles);
      setExistingMediaFiles(prev => [...prev, ...uploadedFiles]);
      setSelectedFiles([]);
    } catch (error) {
      alert('Failed to upload some files. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDeleteMediaFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteMediaFile(fileId);
      setExistingMediaFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      alert('Failed to delete the file. Please try again.');
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 duration-200 bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-4 text-white bg-gradient-to-r from-emerald-600 to-emerald-700 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold sm:text-2xl">
              {project ? 'Edit Project' : 'Add New Project'}
            </h2>
            <button
              onClick={onClose}
              className="transition-colors text-white/80 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Title */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Project Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full input-field"
                placeholder="Enter project title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full resize-none input-field"
                placeholder="Project details and description"
              />
            </div>

            {/* Customer Selection */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Customer *
              </label>

              {!useManualEntry ? (
                <>
                  <ClientAutocomplete
                    customersByAccount={customersByAccount}
                    onSelect={handleCustomerSelect}
                    onManualEntry={handleManualEntry}
                    onSearch={handleSearch}
                    isLoading={loadingCustomers}
                    loadingProgress={loadingProgress}
                    loadingMore={loadingMore}
                    isSearching={isSearching}
                    onLoadMore={handleLoadMore}
                    placeholder="Start typing to search clients..."
                    defaultValue={project?.customerName || ''}
                  />
                  <input type="hidden" {...register('customerId')} />
                  <input type="hidden" {...register('customerName')} />
                </>
              ) : (
                <div className="space-y-2">
                  <input
                    {...register('customerName', { required: 'Customer name is required' })}
                    className="w-full input-field"
                    placeholder="Enter customer name"
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-600">{errors.customerName.message}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setUseManualEntry(false);
                      setValue('customerName', '');
                      setValue('customerId', '');
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to search
                  </button>
                </div>
              )}
            </div>

            {/* Address Section */}
            <div className="p-4 space-y-4 border-2 rounded-lg sm:p-6 border-emerald-200 bg-emerald-50/30">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-emerald-900">Project Address</h3>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Address Line 1 *
                </label>
                <input
                  {...register('addressLine1', { required: 'Address is required' })}
                  className="w-full input-field"
                  placeholder="Street address"
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Address Line 2
                </label>
                <input
                  {...register('addressLine2')}
                  className="w-full input-field"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    City *
                  </label>
                  <select
                    {...register('city', { required: 'City is required' })}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg input-field"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select City
                    </option>
                    {cities.map((mainCity) => (
                      <option key={mainCity} value={mainCity}>
                        {mainCity}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    State
                  </label>
                  <input
                    {...register('state')}
                    className="w-full input-field"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Zipcode
                  </label>
                  <input
                    {...register('zipcode')}
                    className="w-full input-field"
                    placeholder="12345"
                  />
                </div>
              </div>

              {/* Tax Percentage Display */}
              <div className="p-4 bg-white border-2 rounded-lg border-emerald-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Sales Tax Percentage:</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-700">
                    {watch('defaultTaxPercentage') || 0}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {watch('defaultTaxPercentage') ? 'Auto-filled based on city (can be overridden per payment)' : 'Enter city to auto-fill tax percentage'}
                </p>
              </div>
              <input type="hidden" {...register('defaultTaxPercentage')} />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Project Price *
                </label>
                <div className="relative">
                  <span className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2">$</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register('projectPrice', { required: true, min: 0, valueAsNumber: true })}
                    className="w-full pl-8 input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Advance Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2">$</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register('advancePaymentAmount', { min: 0, valueAsNumber: true })}
                    className="w-full pl-8 input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Advance Payment Tax */}
            {watch('advancePaymentAmount') > 0 && (
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="mb-3 text-sm font-semibold text-blue-800">Advance Payment Tax</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Tax Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        {...register('advancePaymentTaxPercentage', { min: 0, max: 100, valueAsNumber: true })}
                        onChange={(e) => {
                          const percentage = parseFloat(e.target.value) || 0;
                          const amount = watch('advancePaymentAmount') || 0;
                          const taxAmount = (amount * percentage) / 100;
                          setValue('advancePaymentTaxAmount', parseFloat(taxAmount.toFixed(2)));
                        }}
                        className="w-full pr-8 input-field"
                        placeholder="0"
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Tax Amount
                    </label>
                    <div className="relative">
                      <span className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2">$</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register('advancePaymentTaxAmount', { min: 0, valueAsNumber: true })}
                        onChange={(e) => {
                          const taxAmount = parseFloat(e.target.value) || 0;
                          const amount = watch('advancePaymentAmount') || 0;
                          if (amount > 0) {
                            const percentage = (taxAmount / amount) * 100;
                            setValue('advancePaymentTaxPercentage', parseFloat(percentage.toFixed(2)));
                          }
                        }}
                        className="w-full pl-8 input-field"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-blue-600">
                  Total with tax: {formatCurrency((watch('advancePaymentAmount') || 0) + (watch('advancePaymentTaxAmount') || 0))}
                </p>
              </div>
            )}

            {/* Commission Rates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Subcontractor % *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    {...register('subcontractorPercentage', { required: true, min: 0, max: 100, valueAsNumber: true })}
                    className="w-full pr-8 input-field"
                    placeholder="70"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2">%</span>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Sales Commission % *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    {...register('salesCommissionPercentage', { required: true, min: 0, max: 100, valueAsNumber: true })}
                    className="w-full pr-8 input-field"
                    placeholder="15"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2">%</span>
                </div>
              </div>
            </div>

            {/* Sales Person and Payment Mode */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Sales Person
                </label>
                <input
                  {...register('salesPerson')}
                  className="w-full input-field"
                  placeholder="Enter sales person name"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Mode of Payment
                </label>
                <select
                  {...register('modeOfPayment')}
                  className="w-full input-field"
                >
                  <option value="">Select payment mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full input-field"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full input-field"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full input-field"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Visibility to Sub-Contractor
              </label>
              <select
                {...register('visibility')}
                className="w-full input-field"
              >
                <option value="public">Public - Full project details visible</option>
                <option value="unlisted">Unlisted - Only dates visible</option>
                <option value="private">Private - Completely hidden</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Controls what the assigned sub-contractor can see about this project
              </p>
            </div>

            {/* Review Collected */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Review Collected
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register('reviewCollected')}
                    value="true"
                    defaultChecked={project?.reviewCollected === true}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register('reviewCollected')}
                    value="false"
                    defaultChecked={project?.reviewCollected !== true}
                    className="w-5 h-5 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">No</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Has a review been collected from the customer for this project?
              </p>
            </div>

            {/* Refund Section */}
            {project && (
              <div className="p-4 space-y-4 border-2 border-red-200 rounded-lg sm:p-6 bg-red-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-900">Refund</h3>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isDiscontinued"
                    {...register('isDiscontinued')}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isDiscontinued" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Discontinue this project
                  </label>
                </div>

                {watch('isDiscontinued') && (
                  <div className="pt-4 space-y-4 border-t border-red-200">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Refund Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register('refundAmount', {
                          valueAsNumber: true,
                          validate: (value) => {
                            if (!watch('isDiscontinued')) return true;
                            if (value <= 0) return 'Refund amount must be greater than 0';
                            const totalPaid = (watch('advancePaymentAmount') || 0) + totalPaymentsReceived;
                            if (value > totalPaid) return `Refund cannot exceed total paid amount (${formatCurrency(totalPaid)})`;
                            return true;
                          }
                        })}
                        className="w-full input-field"
                        placeholder="Enter refund amount"
                      />
                      {errors.refundAmount && (
                        <p className="mt-1 text-sm text-red-600">{errors.refundAmount.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Total paid by client: {formatCurrency((watch('advancePaymentAmount') || 0) + totalPaymentsReceived)}
                      </p>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Refund Date
                      </label>
                      <input
                        type="date"
                        {...register('refundDate', {
                          required: watch('isDiscontinued') && watch('refundAmount') > 0 ? 'Refund date is required' : false
                        })}
                        className="w-full input-field"
                      />
                      {errors.refundDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.refundDate.message}</p>
                      )}
                    </div>

                    <div className="p-4 bg-white border-2 border-red-300 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-sm text-gray-700">
                          <p className="mb-1 font-semibold">This project is marked as discontinued</p>
                          <p className="text-xs">The refund amount will be subtracted from the total client payments and shown separately in the dashboard.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payments Section */}
            <div className="p-4 space-y-4 border-2 border-blue-200 rounded-lg sm:p-6 bg-blue-50/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-blue-900">Payments Received</h3>
                </div>
                {!showAddPayment && (
                  <button
                    type="button"
                    onClick={handleAddPaymentClick}
                    className="px-3 py-2 text-sm btn-primary"
                  >
                    + Add Payment
                  </button>
                )}
              </div>

              {/* Payment Summary */}
              {(Array.isArray(payments) && payments.length > 0) || watch('advancePaymentAmount') > 0 && (
                <div className="p-4 space-y-2 bg-white border-2 border-blue-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Advance Payment:</span>
                    <span className="text-lg font-bold text-emerald-700">{formatCurrency(watch('advancePaymentAmount') || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Manual Payments:</span>
                    <span className="text-lg font-bold text-blue-700">{formatCurrency(totalPaymentsReceived)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <span className="text-sm font-semibold text-gray-700">Total Received:</span>
                    <span className="text-lg font-bold text-blue-700">{formatCurrency((watch('advancePaymentAmount') || 0) + totalPaymentsReceived)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Total Tax Collected:</span>
                    <span className="text-lg font-bold text-blue-700">{formatCurrency(totalTaxCollected)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <span className="text-sm font-semibold text-gray-700">Client Owes:</span>
                    <span className={`text-lg font-bold ${(watch('projectPrice') - (watch('advancePaymentAmount') || 0) - totalPaymentsReceived) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatCurrency(watch('projectPrice') - (watch('advancePaymentAmount') || 0) - totalPaymentsReceived)}
                    </span>
                  </div>
                </div>
              )}

              {/* Add/Edit Payment Form */}
              {showAddPayment && (
                <div className="p-4 space-y-4 bg-white border-2 border-blue-400 rounded-lg">
                  <h4 className="font-semibold text-blue-900">
                    {editingPaymentIndex !== null ? 'Edit Payment' : 'Add New Payment'}
                  </h4>

                  {/* Payment Type */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Payment Type *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value="client_payment"
                          checked={currentPayment.paymentType === 'client_payment'}
                          onChange={(e) => setCurrentPayment({
                            ...currentPayment,
                            paymentType: e.target.value as PaymentType,
                            paidTo: undefined,
                            paidToSalesPerson: ''
                          })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Payment received from Client</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value="outgoing_payment"
                          checked={currentPayment.paymentType === 'subcontractor_payment' || currentPayment.paymentType === 'sales_payment'}
                          onChange={() => setCurrentPayment({
                            ...currentPayment,
                            paymentType: 'subcontractor_payment',
                            paidTo: 'subcontractor',
                            paidToSalesPerson: ''
                          })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Payment KD did to Sub-Contractor or Sales Person</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          value="subcontractor_check_collected"
                          checked={currentPayment.paymentType === 'subcontractor_check_collected'}
                          onChange={(e) => setCurrentPayment({
                            ...currentPayment,
                            paymentType: e.target.value as PaymentType,
                            paidTo: 'subcontractor',
                            paidToSalesPerson: ''
                          })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Check collected by Sub-Contractor</span>
                      </label>
                    </div>
                  </div>

                  {/* Paid To Selection */}
                  {(currentPayment.paymentType === 'subcontractor_payment' || currentPayment.paymentType === 'sales_payment') && (
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Paid To *
                      </label>
                      <select
                        value={currentPayment.paidTo || ''}
                        onChange={(e) => {
                          const recipient = e.target.value as PaymentRecipient;
                          setCurrentPayment({
                            ...currentPayment,
                            paidTo: recipient,
                            paymentType: recipient === 'subcontractor' ? 'subcontractor_payment' : 'sales_payment',
                            paidToSalesPerson: recipient === 'subcontractor' ? '' : currentPayment.paidToSalesPerson
                          });
                        }}
                        className="w-full input-field"
                      >
                        <option value="">Select recipient...</option>
                        <option value="subcontractor">Sub-Contractor</option>
                        <option value="sales_person">Sales Person</option>
                      </select>
                    </div>
                  )}

                  {/* Sales Person Name */}
                  {currentPayment.paymentType === 'sales_payment' && currentPayment.paidTo === 'sales_person' && (
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Sales Person Name *
                      </label>
                      <input
                        type="text"
                        value={currentPayment.paidToSalesPerson || ''}
                        onChange={(e) => setCurrentPayment({ ...currentPayment, paidToSalesPerson: e.target.value })}
                        className="w-full input-field"
                        placeholder="Enter sales person name..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Payment Amount *
                      </label>
                      <div className="relative">
                        <span className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={currentPayment.amount || ''}
                          onChange={(e) => handlePaymentAmountChange(parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 input-field"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Payment Method *
                      </label>
                      <select
                        value={currentPayment.method}
                        onChange={(e) => setCurrentPayment({ ...currentPayment, method: e.target.value as PaymentMethod })}
                        className="w-full input-field"
                      >
                        <option value="Cash 💵">Cash 💵</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Credit card 💳">Credit card 💳</option>
                        <option value="Venmo">Venmo</option>
                        <option value="Zelle">Zelle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Payment Date *
                      </label>
                      <input
                        type="date"
                        value={currentPayment.date}
                        onChange={(e) => setCurrentPayment({ ...currentPayment, date: e.target.value })}
                        className="w-full input-field"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Tax Percentage (%) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={currentPayment.taxPercentage || ''}
                          onChange={(e) => handlePaymentTaxChange(parseFloat(e.target.value) || 0)}
                          className="w-full pr-8 input-field"
                          placeholder="0"
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2">%</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Default: {watch('defaultTaxPercentage') || 0}% (can override)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Tax Amount (Calculated)
                    </label>
                    <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 font-semibold">
                      {formatCurrency(currentPayment.taxAmount || 0)}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Notes
                    </label>
                    <textarea
                      value={currentPayment.notes || ''}
                      onChange={(e) => setCurrentPayment({ ...currentPayment, notes: e.target.value })}
                      rows={2}
                      className="w-full resize-none input-field"
                      placeholder="Additional payment notes..."
                    />
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancelPayment}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePayment}
                      className="flex-1 btn-primary"
                    >
                      {editingPaymentIndex !== null ? 'Update Payment' : 'Save Payment'}
                    </button>
                  </div>
                </div>
              )}

              {/* Payment History */}
              {Array.isArray(payments) && payments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Payment History ({payments.length})</h4>
                  {payments.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="p-4 transition-colors bg-white border border-gray-300 rounded-lg hover:border-blue-400"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                              {payment.method}
                            </span>
                            {/* Payment Type Tags */}
                            {payment.paymentType === 'client_payment' && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                From Client
                              </span>
                            )}
                            {payment.paymentType === 'subcontractor_payment' && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                                To Sub-Contractor
                              </span>
                            )}
                            {payment.paymentType === 'sales_payment' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                To Sales Person
                              </span>
                            )}
                            {payment.paymentType === 'subcontractor_check_collected' && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                Check Collected by Sub-Contractor
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Date: <span className="font-medium">{payment.date}</span>
                          </div>
                          {payment.paidToSalesPerson && payment.paymentType === 'sales_payment' && (
                            <div className="text-sm text-gray-600">
                              Sales Person: <span className="font-medium text-purple-700">{payment.paidToSalesPerson}</span>
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            Tax: <span className="font-medium">{payment.taxPercentage}%</span> = {formatCurrency(payment.taxAmount)}
                          </div>
                          {payment.notes && (
                            <div className="text-sm italic text-gray-500">
                              Note: {payment.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            type="button"
                            onClick={() => handleEditPayment(index)}
                            className="p-2 text-blue-600 hover:text-blue-700"
                            title="Edit payment"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(index)}
                            className="p-2 text-red-600 hover:text-red-700"
                            title="Delete payment"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!Array.isArray(payments) || payments.length === 0) && !showAddPayment && (
                <div className="py-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm">No payments recorded yet</p>
                  <p className="mt-1 text-xs">Click "Add Payment" to record a payment</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full resize-none input-field"
                placeholder="Additional notes..."
              />
            </div>

            {/* Media Files */}
            <div className="pt-6 border-t">
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                Media Files
              </label>

              {/* Existing Files */}
              {project && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Uploaded Files {loadingMedia && <span className="text-xs text-gray-500">(Loading...)</span>}
                  </h4>
                  <MediaFileList
                    mediaFiles={existingMediaFiles}
                    onDelete={handleDeleteMediaFile}
                  />
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {project ? 'Add More Files' : 'Upload Files'}
                </h4>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer btn-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Choose Files
                    <input
                      type="file"
                      multiple
                      accept="video/*,image/*,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="p-4 space-y-2 rounded-lg bg-gray-50">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded">
                        <div className="flex items-center gap-3">
                          {file.type.startsWith('video/') ? (
                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          ) : file.type.startsWith('image/') ? (
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedFile(index)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Remove file"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadingFiles && (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">Uploading files...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {project ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div >
    </div >
  );
}