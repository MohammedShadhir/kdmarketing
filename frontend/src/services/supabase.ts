import { createClient } from '@supabase/supabase-js';
import type { SubContractor, Project } from '@/types/domain';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSubContractors(): Promise<SubContractor[]> {
  const { data, error } = await supabase
    .from('subcontractors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapSubContractorFromDB);
}

export async function getSubContractor(id: string): Promise<SubContractor | null> {
  const { data, error } = await supabase
    .from('subcontractors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapSubContractorFromDB(data) : null;
}

export async function createSubContractor(
  subContractor: Omit<SubContractor, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SubContractor> {
  const dbData = mapSubContractorToDB(subContractor);

  const { data, error } = await supabase
    .from('subcontractors')
    .insert([dbData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSubContractorFromDB(data);
}

export async function updateSubContractor(
  id: string,
  updates: Partial<SubContractor> & { password?: string }
): Promise<SubContractor> {
  const dbData = mapSubContractorToDB(updates);

  if (updates.password !== undefined && updates.password.trim() !== '') {
    dbData.password_hash = updates.password;
  }

  const { data, error } = await supabase
    .from('subcontractors')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSubContractorFromDB(data);
}

export async function deleteSubContractor(id: string): Promise<void> {
  const { error } = await supabase
    .from('subcontractors')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSubContractorProjectCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('projects')
    .select('subcontractor_id');

  if (error) {
    return {};
  }

  const counts: Record<string, number> = {};
  data.forEach((project) => {
    if (project.subcontractor_id) {
      counts[project.subcontractor_id] = (counts[project.subcontractor_id] || 0) + 1;
    }
  });

  return counts;
}

export async function mergeSubContractors(
  keepId: string,
  mergeId: string
): Promise<{ success: boolean; projectsMoved: number }> {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .update({ subcontractor_id: keepId })
      .eq('subcontractor_id', mergeId)
      .select();

    if (projectsError) {
      throw new Error(projectsError.message);
    }

    const projectsMoved = projects?.length || 0;

    const { error: deleteError } = await supabase
      .from('subcontractors')
      .delete()
      .eq('id', mergeId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return { success: true, projectsMoved };
  } catch (error) {
    throw error;
  }
}

export async function getProjects(subContractorId?: string): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*')
    .order('start_date', { ascending: false });

  if (subContractorId) {
    query = query.eq('subcontractor_id', subContractorId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapProjectFromDB);
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapProjectFromDB(data);
}

export async function createProject(
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const dbData = mapProjectToDB(project);

  const { data, error } = await supabase
    .from('projects')
    .insert([dbData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProjectFromDB(data);
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project> {
  const dbData = mapProjectToDB(updates);

  const { data, error } = await supabase
    .from('projects')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProjectFromDB(data);
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getProjectsByCreator(creatorId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('created_by', creatorId)
    .order('start_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapProjectFromDB);
}

export async function getProjectsBySubContractor(subContractorId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('subcontractor_id', subContractorId)
    .order('start_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapProjectFromDB);
}

export async function getProjectsByDateRange(
  subContractorId: string,
  startDate: string,
  endDate: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('subcontractor_id', subContractorId)
    .gte('start_date', startDate)
    .lte('end_date', endDate);

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapProjectFromDB);
}

export async function getAllUsers(): Promise<any[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true});

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function updateUser(
  id: string,
  updates: { name?: string; email?: string; is_active?: boolean; password?: string; default_sales_commission?: number }
): Promise<any> {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
  if (updates.default_sales_commission !== undefined) dbUpdates.default_sales_commission = updates.default_sales_commission;
  if (updates.password !== undefined && updates.password.trim() !== '') {
    dbUpdates.password_hash = updates.password;
  }

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

function mapSubContractorFromDB(data: any): SubContractor {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    companyName: data.company_name,
    defaultSubcontractorPercentage: data.default_subcontractor_percentage,
    defaultSalesPercentage: data.default_sales_percentage,
    address: data.address,
    notes: data.notes,
    profilePictureUrl: data.profile_picture_url,
    lastKnownLat: data.last_known_lat,
    lastKnownLng: data.last_known_lng,
    lastSeenAt: data.last_seen_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapSubContractorToDB(data: Partial<SubContractor>): any {
  const dbData: any = {};

  if (data.name !== undefined) dbData.name = data.name;
  if (data.email !== undefined) dbData.email = data.email;
  if (data.phone !== undefined) dbData.phone = data.phone;
  if (data.companyName !== undefined) dbData.company_name = data.companyName;
  if (data.defaultSubcontractorPercentage !== undefined)
    dbData.default_subcontractor_percentage = data.defaultSubcontractorPercentage;
  if (data.defaultSalesPercentage !== undefined)
    dbData.default_sales_percentage = data.defaultSalesPercentage;
  if (data.address !== undefined) dbData.address = data.address;
  if (data.notes !== undefined) dbData.notes = data.notes;
  if (data.profilePictureUrl !== undefined) dbData.profile_picture_url = data.profilePictureUrl;

  return dbData;
}

function mapProjectFromDB(data: any): Project {
  return {
    id: data.id,
    subContractorId: data.subcontractor_id,
    title: data.title,
    description: data.description,
    customerName: data.customer_name,
    customerId: data.customer_id,
    projectPrice: parseFloat(data.project_price) || 0,
    subcontractorPercentage: parseFloat(data.subcontractor_percentage) || 0,
    salesCommissionPercentage: parseFloat(data.sales_commission_percentage) || 0,
    salesPerson: data.sales_person,
    advancePaymentAmount: data.advance_payment_amount ? parseFloat(data.advance_payment_amount) : undefined,
    advancePaymentTaxPercentage: data.advance_payment_tax_percentage ? parseFloat(data.advance_payment_tax_percentage) : 0,
    advancePaymentTaxAmount: data.advance_payment_tax_amount ? parseFloat(data.advance_payment_tax_amount) : 0,
    modeOfPayment: data.mode_of_payment,
    startDate: data.start_date,
    endDate: data.end_date,
    notes: data.notes,
    status: data.status,
    visibility: data.visibility,
    addressLine1: data.address_line1,
    addressLine2: data.address_line2,
    city: data.city,
    state: data.state,
    zipcode: data.zipcode,
    defaultTaxPercentage: data.default_tax_percentage ? parseFloat(data.default_tax_percentage) : undefined,
    payments: data.payments
      ? (typeof data.payments === 'string' ? JSON.parse(data.payments) : data.payments)
      : [],
    totalPaymentsReceived: data.total_payments_received ? parseFloat(data.total_payments_received) : 0,
    totalTaxCollected: data.total_tax_collected ? parseFloat(data.total_tax_collected) : 0,
    remainingBalance: data.remaining_balance ? parseFloat(data.remaining_balance) : 0,
    refundAmount: data.refund_amount ? parseFloat(data.refund_amount) : undefined,
    refundDate: data.refund_date,
    isDiscontinued: data.is_discontinued || false,
    mediaFiles: [],
    reviewCollected: data.review_collected || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapProjectToDB(data: Partial<Project>): any {
  const dbData: any = {};

  if (data.subContractorId !== undefined) dbData.subcontractor_id = data.subContractorId;
  if (data.title !== undefined) dbData.title = data.title;
  if (data.description !== undefined) dbData.description = data.description;
  if (data.customerName !== undefined) dbData.customer_name = data.customerName;
  if (data.customerId !== undefined) dbData.customer_id = data.customerId;
  if (data.projectPrice !== undefined) dbData.project_price = data.projectPrice;
  if (data.subcontractorPercentage !== undefined)
    dbData.subcontractor_percentage = data.subcontractorPercentage;
  if (data.salesCommissionPercentage !== undefined)
    dbData.sales_commission_percentage = data.salesCommissionPercentage;
  if (data.salesPerson !== undefined) dbData.sales_person = data.salesPerson;
  if (data.advancePaymentAmount !== undefined)
    dbData.advance_payment_amount = data.advancePaymentAmount;
  if (data.advancePaymentTaxPercentage !== undefined)
    dbData.advance_payment_tax_percentage = data.advancePaymentTaxPercentage;
  if (data.advancePaymentTaxAmount !== undefined)
    dbData.advance_payment_tax_amount = data.advancePaymentTaxAmount;
  if (data.modeOfPayment !== undefined) dbData.mode_of_payment = data.modeOfPayment;
  if (data.startDate !== undefined) dbData.start_date = data.startDate || null;
  if (data.endDate !== undefined) dbData.end_date = data.endDate || null;
  if (data.notes !== undefined) dbData.notes = data.notes;
  if (data.status !== undefined) dbData.status = data.status;
  if (data.visibility !== undefined) dbData.visibility = data.visibility;

  if (data.addressLine1 !== undefined) dbData.address_line1 = data.addressLine1;
  if (data.addressLine2 !== undefined) dbData.address_line2 = data.addressLine2;
  if (data.city !== undefined) dbData.city = data.city;
  if (data.state !== undefined) dbData.state = data.state;
  if (data.zipcode !== undefined) dbData.zipcode = data.zipcode;
  if (data.defaultTaxPercentage !== undefined) dbData.default_tax_percentage = data.defaultTaxPercentage;

  if (data.payments !== undefined) {
    dbData.payments = Array.isArray(data.payments) ? data.payments : [];
  }
  if (data.totalPaymentsReceived !== undefined) dbData.total_payments_received = data.totalPaymentsReceived;
  if (data.totalTaxCollected !== undefined) dbData.total_tax_collected = data.totalTaxCollected;
  if (data.remainingBalance !== undefined) dbData.remaining_balance = data.remainingBalance;

  if (data.refundAmount !== undefined) {
    dbData.refund_amount = data.refundAmount > 0 ? data.refundAmount : 0;
  }
  if (data.refundDate !== undefined) {
    dbData.refund_date = data.refundDate || null;
  }
  if (data.isDiscontinued !== undefined) {
    dbData.is_discontinued = Boolean(data.isDiscontinued);
  }

  if (data.reviewCollected !== undefined) {
    dbData.review_collected = Boolean(data.reviewCollected);
  }

  return dbData;
}

export async function uploadProfilePicture(
  subContractorId: string,
  file: File
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${subContractorId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    await updateSubContractor(subContractorId, {
      profilePictureUrl: urlData.publicUrl,
    } as any);

    return urlData.publicUrl;
  } catch (error) {
    throw error;
  }
}

export async function deleteProfilePicture(subContractorId: string): Promise<void> {
  try {
    const subContractor = await getSubContractor(subContractorId);
    if (!subContractor?.profilePictureUrl) {
      return;
    }

    const url = new URL(subContractor.profilePictureUrl);
    const pathParts = url.pathname.split('/profile-pictures/');
    const fileName = pathParts[pathParts.length - 1];

    const { error: storageError } = await supabase.storage
      .from('profile-pictures')
      .remove([fileName]);

    if (storageError) {
      throw new Error(storageError.message);
    }

    await updateSubContractor(subContractorId, {
      profilePictureUrl: null,
    } as any);
  } catch (error) {
    throw error;
  }
}

export async function uploadUserProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `user-${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    await updateUser(userId, {
      profile_picture_url: urlData.publicUrl,
    } as any);

    return urlData.publicUrl;
  } catch (error) {
    throw error;
  }
}

export async function deleteUserProfilePicture(userId: string): Promise<void> {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('profile_picture_url')
      .eq('id', userId)
      .single();

    if (fetchError || !user?.profile_picture_url) {
      return;
    }

    const url = new URL(user.profile_picture_url);
    const pathParts = url.pathname.split('/profile-pictures/');
    const fileName = pathParts[pathParts.length - 1];

    const { error: storageError } = await supabase.storage
      .from('profile-pictures')
      .remove([fileName]);

    if (storageError) {
      throw new Error(storageError.message);
    }

    await updateUser(userId, {
      profile_picture_url: null,
    } as any);
  } catch (error) {
    throw error;
  }
}

export async function uploadMediaFile(
  projectId: string,
  file: File
): Promise<{ id: string; name: string; url: string; type: string; size: number; uploadedAt: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('project-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from('project-media')
      .getPublicUrl(fileName);

    const { data: mediaRecord, error: dbError } = await supabase
      .from('project_media')
      .insert([
        {
          project_id: projectId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
        },
      ])
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from('project-media').remove([fileName]);
      throw new Error(dbError.message);
    }

    return {
      id: mediaRecord.id,
      name: mediaRecord.file_name,
      url: mediaRecord.file_url,
      type: mediaRecord.file_type,
      size: mediaRecord.file_size,
      uploadedAt: mediaRecord.uploaded_at,
    };
  } catch (error) {
    throw error;
  }
}

export async function getProjectMedia(projectId: string) {
  const { data, error } = await supabase
    .from('project_media')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((record) => ({
    id: record.id,
    name: record.file_name,
    url: record.file_url,
    type: record.file_type,
    size: record.file_size,
    uploadedAt: record.uploaded_at,
  }));
}

export async function deleteMediaFile(mediaId: string): Promise<void> {
  const { data: mediaRecord, error: fetchError } = await supabase
    .from('project_media')
    .select('*')
    .eq('id', mediaId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const url = new URL(mediaRecord.file_url);
  const pathParts = url.pathname.split('/project-media/');
  const storagePath = pathParts[pathParts.length - 1];

  const { error: storageError } = await supabase.storage
    .from('project-media')
    .remove([storagePath]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: dbError } = await supabase
    .from('project_media')
    .delete()
    .eq('id', mediaId);

  if (dbError) {
    throw new Error(dbError.message);
  }
}

export async function uploadMultipleMediaFiles(
  projectId: string,
  files: File[]
): Promise<Array<{ id: string; name: string; url: string; type: string; size: number; uploadedAt: string }>> {
  const uploadPromises = files.map((file) => uploadMediaFile(projectId, file));
  return Promise.all(uploadPromises);
}

export interface SalesSubcontractorAssignment {
  id: string;
  salesUserId: string;
  subcontractorId: string;
  createdAt: string;
}

export async function getAssignmentsForSalesUser(salesUserId: string): Promise<SalesSubcontractorAssignment[]> {
  const { data, error } = await supabase
    .from('sales_subcontractor_assignments')
    .select('*')
    .eq('sales_user_id', salesUserId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((row) => ({
    id: row.id,
    salesUserId: row.sales_user_id,
    subcontractorId: row.subcontractor_id,
    createdAt: row.created_at,
  }));
}

export async function getAllAssignments(): Promise<SalesSubcontractorAssignment[]> {
  const { data, error } = await supabase
    .from('sales_subcontractor_assignments')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data.map((row) => ({
    id: row.id,
    salesUserId: row.sales_user_id,
    subcontractorId: row.subcontractor_id,
    createdAt: row.created_at,
  }));
}

export async function addAssignment(salesUserId: string, subcontractorId: string): Promise<SalesSubcontractorAssignment> {
  const { data, error } = await supabase
    .from('sales_subcontractor_assignments')
    .insert([{ sales_user_id: salesUserId, subcontractor_id: subcontractorId }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    salesUserId: data.sales_user_id,
    subcontractorId: data.subcontractor_id,
    createdAt: data.created_at,
  };
}

export async function removeAssignment(assignmentId: string): Promise<void> {
  const { error } = await supabase
    .from('sales_subcontractor_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearAssignmentsForSalesUser(salesUserId: string): Promise<void> {
  const { error } = await supabase
    .from('sales_subcontractor_assignments')
    .delete()
    .eq('sales_user_id', salesUserId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSubContractorsForSalesUser(salesUserId: string): Promise<SubContractor[]> {
  const { data: assignments, error: assignmentError } = await supabase
    .from('sales_subcontractor_assignments')
    .select('subcontractor_id')
    .eq('sales_user_id', salesUserId);

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  if (!assignments || assignments.length === 0) {
    return getSubContractors();
  }

  const subcontractorIds = assignments.map((a) => a.subcontractor_id);
  const { data, error } = await supabase
    .from('subcontractors')
    .select('*')
    .in('id', subcontractorIds)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapSubContractorFromDB);
}

export async function bulkAssignSubcontractors(
  salesUserId: string,
  subcontractorIds: string[]
): Promise<void> {
  await clearAssignmentsForSalesUser(salesUserId);

  if (subcontractorIds.length === 0) {
    return;
  }

  const assignments = subcontractorIds.map((subcontractorId) => ({
    sales_user_id: salesUserId,
    subcontractor_id: subcontractorId,
  }));

  const { error } = await supabase
    .from('sales_subcontractor_assignments')
    .insert(assignments);

  if (error) {
    throw new Error(error.message);
  }
}

export async function generateServerReport(
  subContractorId: string,
  month: string,
  format: 'csv' = 'csv'
): Promise<void> {
  const { data, error } = await supabase.functions.invoke('generate-report', {
    body: { subContractorId, month, format },
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate report');
  }

  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const timestamp = new Date().getTime();
  link.href = url;
  link.download = `Report_${monthName.replace(/\s+/g, '_')}_${timestamp}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
