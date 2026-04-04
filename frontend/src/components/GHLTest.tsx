import { useState } from 'react';
import { getContacts, createContact, getAppointments, type Contact } from '../services/supabaseGHL';

export function GHLTest() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGetContacts = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await getContacts(10, 0);

      setContacts(response.contacts || []);
      setSuccessMessage(`Successfully fetched ${response.contacts?.length || 0} contacts!`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const testContact = {
        firstName: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@example.com`,
        phone: '+1234567890',
        tags: ['test', 'api-integration']
      };

      const response = await createContact(testContact);

      setSuccessMessage(`Contact created successfully! ID: ${response.contact.id}`);

      handleGetContacts();
    } catch (err: any) {
      setError(err.message || 'Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAppointments = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await getAppointments();

      setSuccessMessage(`Successfully fetched ${response.events?.length || 0} appointments!`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-8">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🧪 GHL Integration Test
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Test your GoHighLevel API integration. Check browser console for detailed logs.
        </p>
      </div>

      {}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-600 mr-2">❌</span>
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-green-600 mr-2">✅</span>
            <div>
              <p className="text-green-800 font-semibold">Success</p>
              <p className="text-green-700 text-sm mt-1">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleGetContacts}
          disabled={loading}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '⏳ Loading...' : '📋 Get Contacts'}
        </button>

        <button
          onClick={handleCreateContact}
          disabled={loading}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '⏳ Creating...' : '➕ Create Test Contact'}
        </button>

        <button
          onClick={handleGetAppointments}
          disabled={loading}
          className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '⏳ Loading...' : '📅 Get Appointments'}
        </button>
      </div>

      {}
      {contacts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Contacts ({contacts.length})
          </h3>
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      📧 {contact.email || 'No email'}
                    </p>
                    {contact.phone && (
                      <p className="text-sm text-gray-600">
                        📞 {contact.phone}
                      </p>
                    )}
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {contact.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-4">
                    ID: {contact.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">📝 Testing Instructions</h4>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Click <strong>"Get Contacts"</strong> to fetch contacts from GHL</li>
          <li>Click <strong>"Create Test Contact"</strong> to add a new contact</li>
          <li>Click <strong>"Get Appointments"</strong> to fetch calendar appointments</li>
          <li>Open browser DevTools Console (F12) to see detailed logs</li>
          <li>Check for any error messages above</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">
          ⚠️ Remove this component after successful testing
        </p>
      </div>

      {}
      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs font-mono text-blue-900">
          <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
        </p>
        <p className="text-xs font-mono text-blue-900 mt-1">
          <strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}
        </p>
      </div>
    </div>
  );
}

export default GHLTest;
