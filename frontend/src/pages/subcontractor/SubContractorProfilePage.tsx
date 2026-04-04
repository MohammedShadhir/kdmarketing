import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getSubContractor, uploadProfilePicture, deleteProfilePicture } from '@/services/supabase';
import { SubContractor } from '@/types/domain';
import { User, Mail, Phone, Building2, MapPin, FileText, Calendar, Percent, Loader2, Camera, Trash2 } from 'lucide-react';

export function SubContractorProfilePage() {
  const { user } = useAuthStore();
  const [subContractor, setSubContractor] = useState<SubContractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.subContractorId) {
        setError('No sub-contractor profile found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getSubContractor(user.subContractorId);
        setSubContractor(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !subContractor) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingPicture(true);
      const url = await uploadProfilePicture(subContractor.id, file);

      setSubContractor({
        ...subContractor,
        profilePictureUrl: url,
      });
    } catch (err: any) {
      alert('Failed to upload profile picture: ' + err.message);
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePicture = async () => {
    if (!subContractor || !subContractor.profilePictureUrl) return;

    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      setUploadingPicture(true);
      await deleteProfilePicture(subContractor.id);

      setSubContractor({
        ...subContractor,
        profilePictureUrl: undefined,
      });
    } catch (err: any) {
      alert('Failed to delete profile picture: ' + err.message);
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !subContractor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">{error || 'Unable to load your profile'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl shadow-lg p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                {subContractor.profilePictureUrl ? (
                  <img
                    src={subContractor.profilePictureUrl}
                    alt={subContractor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-colors"
                >
                  {uploadingPicture ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
                {subContractor.profilePictureUrl && (
                  <button
                    onClick={handleDeletePicture}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{subContractor.name}</h1>
              <p className="text-blue-100">Sub-Contractor Profile</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">{subContractor.email || 'Not provided'}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-base text-gray-900">{subContractor.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Company Name */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Company Name</p>
                <p className="text-base text-gray-900">{subContractor.companyName || 'Not provided'}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-base text-gray-900">{subContractor.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Rates */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-600" />
            Default Commission Rates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subcontractor Rate */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
              <p className="text-sm font-medium text-blue-700 mb-2">Your Default Rate</p>
              <p className="text-4xl font-bold text-blue-900">
                {subContractor.defaultSubcontractorPercentage || 0}%
              </p>
              <p className="text-sm text-blue-600 mt-2">Of project price</p>
            </div>

            {/* Sales Commission */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200">
              <p className="text-sm font-medium text-emerald-700 mb-2">Sales Commission</p>
              <p className="text-4xl font-bold text-emerald-900">
                {subContractor.defaultSalesPercentage || 0}%
              </p>
              <p className="text-sm text-emerald-600 mt-2">Of project price</p>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {subContractor.notes && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Additional Notes
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{subContractor.notes}</p>
          </div>
        )}

        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Account Created</p>
                <p className="text-base text-gray-900">
                  {subContractor.createdAt
                    ? new Date(subContractor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-base text-gray-900">
                  {subContractor.updatedAt
                    ? new Date(subContractor.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}