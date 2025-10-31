'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import { useLanguage } from '../../components/LanguageProvider';
import { useAdminAuth } from '@/app/context/AdminAuthContext';

export default function ContactsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { admin, loading: authLoading } = useAdminAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, authLoading, router]);

  // Fetch contacts on mount
  useEffect(() => {
    if (admin && !authLoading) {
      fetchContacts();
    }
  }, [admin, authLoading]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        fetchContacts();
        if (selectedContact?._id === id) {
          setSelectedContact({ ...selectedContact, status });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'read':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'replied':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (filterStatus === 'all') return true;
    return contact.status === filterStatus;
  });

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, return null (will redirect)
  if (!admin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar
        currentPage="contacts"
        onNavigate={(page) => {
          if (page === 'finance' || page === 'transactions') {
            router.push(`/admin/${page}`);
          } else {
            router.push(`/admin/dashboard?page=${page}`);
          }
        }}
      />

      <div className="flex-1 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('contactSubmissions')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('manageCustomerInquiries')}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('all')} ({contacts.length})
              </button>
              <button
                onClick={() => setFilterStatus('new')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'new'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('new')} ({contacts.filter((c) => c.status === 'new').length})
              </button>
              <button
                onClick={() => setFilterStatus('read')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'read'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('read')} ({contacts.filter((c) => c.status === 'read').length})
              </button>
              <button
                onClick={() => setFilterStatus('replied')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'replied'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t('replied')} ({contacts.filter((c) => c.status === 'replied').length})
              </button>
            </div>

            <button
              onClick={fetchContacts}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              {t('refresh')}
            </button>
          </div>

          {/* Contacts List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {t('loadingContacts')}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {t('noContactsFound')}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {contact.fullName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contact.email}
                      </p>
                      {contact.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {contact.phone}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        contact.status
                      )}`}
                    >
                      {t(contact.status)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('subject')}:
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      {contact.subject}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {contact.message}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(contact.createdAt)}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {t('clickToViewDetails')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedContact.fullName}
                  </h2>
                  <div className="space-y-1">
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline block"
                    >
                      {selectedContact.email}
                    </a>
                    {selectedContact.phone && (
                      <a
                        href={`tel:${selectedContact.phone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline block"
                      >
                        {selectedContact.phone}
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t('subject')}: <span className="font-medium">{selectedContact.subject}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('submittedOn')}: {formatDate(selectedContact.createdAt)}
                </p>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('messageLabel')}:
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('statusLabel')}:
                </span>
                <select
                  value={selectedContact.status}
                  onChange={(e) => updateStatus(selectedContact._id, e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">{t('new')}</option>
                  <option value="read">{t('read')}</option>
                  <option value="replied">{t('replied')}</option>
                </select>

                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  {t('replyViaEmail')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
