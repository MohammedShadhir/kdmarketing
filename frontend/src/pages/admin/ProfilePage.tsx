import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { uploadUserProfilePicture, deleteUserProfilePicture } from '@/services/supabase';
import { User, Mail, Shield, Calendar, Loader2, Camera, Trash2 } from 'lucide-react';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

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
      const url = await uploadUserProfilePicture(user.id, file);

      setUser({
        ...user,
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
    if (!user || !user.profilePictureUrl) return;

    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      setUploadingPicture(true);
      await deleteUserProfilePicture(user.id);

      setUser({
        ...user,
        profilePictureUrl: undefined,
      });
    } catch (err: any) {
      alert('Failed to delete profile picture: ' + err.message);
    } finally {
      setUploadingPicture(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-t-2xl shadow-lg p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.name}
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
                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full cursor-pointer transition-colors"
                >
                  {uploadingPicture ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
                {user.profilePictureUrl && (
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
              <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-emerald-100">Administrator Profile</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-base text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>

            {/* Last Login */}
            {user.lastLogin && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Login</p>
                  <p className="text-base text-gray-900">
                    {new Date(user.lastLogin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Account Status</p>
                <p className="text-base text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}