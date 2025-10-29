/**
 * Storage Migration Integration Examples
 *
 * This file demonstrates how to integrate the new storage migration hooks
 * into existing components like UserDashboard and BookingsPage.
 *
 * These are complete examples showing the recommended patterns for
 * migrating from localStorage to Supabase with zero data loss.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useBookings,
  useUserPreferences,
  useDraftBooking,
  useStorageMigration,
} from '@/hooks/shared';
import type { IStoredBooking } from '@/utils/localStorageTypes';

/**
 * Example 1: Updated UserDashboard Component
 *
 * Shows how to replace direct localStorage access with the useBookings hook
 * for seamless migration support.
 */
export const UserDashboardExample = (): JSX.Element => {
  const { t } = useTranslation('common');
  const [userId] = useState<string>('example-user-id'); // Get from auth context

  // Replace localStorage reads with useBookings hook
  const {
    bookings: allBookings,
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useBookings(userId, 'all', true);

  // Load user preferences with migration support
  const {
    preferences,
    isLoading: preferencesLoading,
    updateLanguage,
    updateUISettings,
  } = useUserPreferences(userId, true);

  // Optional: Monitor migration health
  const {
    health: migrationHealth,
    checkHealth,
    migrateToSupabase,
  } = useStorageMigration(userId, true);

  // Filter bookings by status
  const pendingBookings = allBookings.filter((b) => b.status === 'pending');
  const upcomingBookings = allBookings.filter(
    (b) => b.status === 'approved' && new Date(b.startDate) > new Date()
  );

  // Handle language change with automatic storage
  const handleLanguageChange = async (lang: 'en' | 'no'): Promise<void> => {
    try {
      await updateLanguage(lang);
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  // Handle view mode change
  const handleViewModeChange = async (mode: 'grid' | 'list'): Promise<void> => {
    try {
      await updateUISettings({ viewMode: mode });
    } catch (error) {
      console.error('Failed to update view mode:', error);
    }
  };

  // Optional: Trigger manual migration if needed
  const handleManualMigration = async (): Promise<void> => {
    try {
      const result = await migrateToSupabase();
      if (result.success) {
        console.log(`Successfully migrated ${result.migrated} bookings`);
        await refetchBookings();
      } else {
        console.error('Migration errors:', result.errors);
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  // Show loading state
  if (bookingsLoading || preferencesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  // Show error state
  if (bookingsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          Error loading bookings: {bookingsError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with preferences */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <div className="flex items-center gap-4">
          <select
            value={preferences.language}
            onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'no')}
            className="h-10 px-4 border border-gray-300 rounded-lg"
          >
            <option value="en">English</option>
            <option value="no">Norsk</option>
          </select>
          <button
            onClick={() =>
              handleViewModeChange(preferences.uiSettings.viewMode === 'grid' ? 'list' : 'grid')
            }
            className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Toggle View
          </button>
        </div>
      </div>

      {/* Migration health indicator (optional, for debugging) */}
      {migrationHealth && !migrationHealth.dataConsistent && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-900">Data Sync Warning</h3>
              <p className="text-sm text-yellow-700">
                Local: {migrationHealth.localBookingsCount} | Supabase:{' '}
                {migrationHealth.supabaseBookingsCount}
              </p>
            </div>
            <button
              onClick={handleManualMigration}
              className="h-10 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Sync Now
            </button>
          </div>
        </div>
      )}

      {/* Bookings display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Pending Bookings ({pendingBookings.length})
          </h2>
          {pendingBookings.length === 0 ? (
            <p className="text-gray-600">No pending bookings</p>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{booking.facilityName}</h3>
                  <p className="text-sm text-gray-600">
                    {booking.startDate} at {booking.startTime}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Upcoming Bookings ({upcomingBookings.length})
          </h2>
          {upcomingBookings.length === 0 ? (
            <p className="text-gray-600">No upcoming bookings</p>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{booking.facilityName}</h3>
                  <p className="text-sm text-gray-600">
                    {booking.startDate} at {booking.startTime}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Example 2: Updated Admin BookingsPage Component
 *
 * Shows how to use the hooks for managing bookings with full CRUD operations
 * and automatic storage migration.
 */
export const AdminBookingsPageExample = (): JSX.Element => {
  const { t } = useTranslation('admin');
  const [userId] = useState<string>('admin-user-id'); // Get from auth context

  // Load bookings with migration support
  const {
    bookings,
    isLoading,
    error,
    updateBooking,
    deleteBooking,
    refetch,
  } = useBookings(userId, 'all', true);

  // Load user preferences for filters
  const { preferences, updateFilters } = useUserPreferences(userId, true);

  // Apply filters from preferences
  const filteredBookings = bookings.filter((booking) => {
    if (preferences.filters.status && preferences.filters.status.length > 0) {
      if (!booking.status || !preferences.filters.status.includes(booking.status)) {
        return false;
      }
    }

    if (preferences.filters.searchQuery) {
      const query = preferences.filters.searchQuery.toLowerCase();
      const facilityName = booking.facilityName?.toLowerCase() || '';
      const bookerName = booking.bookerName?.toLowerCase() || '';
      if (!facilityName.includes(query) && !bookerName.includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Handle booking approval
  const handleApprove = async (bookingId: string): Promise<void> => {
    try {
      await updateBooking(bookingId, {
        status: 'approved',
        processedBy: userId,
        processedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  // Handle booking rejection
  const handleReject = async (bookingId: string): Promise<void> => {
    try {
      await updateBooking(bookingId, {
        status: 'rejected',
        processedBy: userId,
        processedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  // Handle booking deletion
  const handleDelete = async (bookingId: string): Promise<void> => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(bookingId);
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
  };

  // Handle filter change
  const handleFilterChange = async (filters: { status?: string[] }): Promise<void> => {
    try {
      await updateFilters(filters);
    } catch (error) {
      console.error('Failed to update filters:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('bookings.title')}</h1>
        <button
          onClick={() => refetch()}
          className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-xl shadow-md">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.filters.status?.includes('pending') || false}
              onChange={(e) => {
                const currentStatuses = preferences.filters.status || [];
                const newStatuses = e.target.checked
                  ? [...currentStatuses, 'pending']
                  : currentStatuses.filter((s) => s !== 'pending');
                handleFilterChange({ status: newStatuses });
              }}
            />
            <span>Pending</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.filters.status?.includes('approved') || false}
              onChange={(e) => {
                const currentStatuses = preferences.filters.status || [];
                const newStatuses = e.target.checked
                  ? [...currentStatuses, 'approved']
                  : currentStatuses.filter((s) => s !== 'approved');
                handleFilterChange({ status: newStatuses });
              }}
            />
            <span>Approved</span>
          </label>
        </div>
      </div>

      {/* Bookings list */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-600 bg-white rounded-xl shadow-md">
            No bookings found
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="p-6 bg-white rounded-xl shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{booking.facilityName}</h3>
                  <p className="text-gray-600">
                    {booking.startDate} at {booking.startTime}
                  </p>
                  <p className="text-sm text-gray-500">Booked by: {booking.bookerName}</p>
                  <div className="mt-2">
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full ${
                        booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(booking.id)}
                        className="h-10 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        className="h-10 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="h-10 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Example 3: Booking Form with Draft Support
 *
 * Shows how to use useDraftBooking for multi-step forms with auto-save.
 */
export const BookingFormExample = (): JSX.Element => {
  const { t } = useTranslation('booking');
  const [userId] = useState<string>('user-id'); // Get from auth context
  const [formData, setFormData] = useState<Partial<IStoredBooking>>({});

  // Load draft with auto-save enabled
  const {
    draft,
    hasDraft,
    isSaving,
    saveDraft,
    clearDraft,
  } = useDraftBooking(userId, undefined, true, 3000);

  // Get bookings hook for submission
  const { addBooking } = useBookings(userId, 'pending', false);

  // Load draft into form on mount
  useEffect(() => {
    if (draft) {
      setFormData(draft);
    }
  }, [draft]);

  // Auto-save on form changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      saveDraft(formData);
    }
  }, [formData, saveDraft]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      const booking: IStoredBooking = {
        id: `booking_${Date.now()}`,
        facilityId: formData.facilityId || '',
        facilityName: formData.facilityName || '',
        startDate: formData.startDate || '',
        startTime: formData.startTime || '',
        endTime: formData.endTime || '',
        status: 'pending',
        bookerName: formData.bookerName || '',
        bookerEmail: formData.bookerEmail || '',
        submittedAt: new Date().toISOString(),
      };

      await addBooking(booking);
      await clearDraft();
      setFormData({});

      alert('Booking submitted successfully!');
    } catch (error) {
      console.error('Failed to submit booking:', error);
      alert('Failed to submit booking');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('form.title')}</h2>
          {hasDraft && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {isSaving ? 'Saving...' : 'Draft saved'}
              </span>
              <button
                onClick={() => clearDraft()}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="facilityName" className="block text-sm font-medium text-gray-700 mb-2">
              Facility Name
            </label>
            <input
              id="facilityName"
              type="text"
              value={formData.facilityName || ''}
              onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
              className="h-12 w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="h-12 w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                id="startTime"
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="h-12 w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                id="endTime"
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="h-12 w-full px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Booking
          </button>
        </form>
      </div>
    </div>
  );
};
