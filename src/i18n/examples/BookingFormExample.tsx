import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoleTranslation } from '../hooks/useRoleTranslation';
import { useNorwegianFormat } from '../hooks/useNorwegianFormat';
import type { UserRole } from '../types/i18next';

interface BookingFormProps {
  readonly userRole: UserRole;
  readonly facilityId: string;
  readonly onSubmit?: (data: BookingData) => void;
}

interface BookingData {
  readonly facilityId: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly participants: number;
  readonly description: string;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

export const BookingFormExample = ({
  userRole,
  facilityId,
  onSubmit
}: BookingFormProps): JSX.Element => {
  // Translation hooks
  const { t: commonT, i18n } = useTranslation('common');
  const { t: bookingT } = useTranslation('booking');
  const { t: validationT } = useTranslation('validation');
  const { t: roleT } = useRoleTranslation({ role: userRole, namespace: 'booking' });

  // Formatting hook
  const {
    formatCurrency,
    formatDate,
    formatTime,
    formatPhoneNumber,
    locale
  } = useNorwegianFormat();

  // Form state
  const [formData, setFormData] = useState<BookingData>({
    facilityId,
    date: '',
    startTime: '',
    endTime: '',
    participants: 1,
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate price based on hours and participants
  const calculatedPrice = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return 0;

    const start = new Date(`1970-01-01T${formData.startTime}`);
    const end = new Date(`1970-01-01T${formData.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const basePrice = 500; // NOK per hour
    const participantMultiplier = formData.participants > 10 ? 1.5 : 1;

    return Math.max(0, hours * basePrice * participantMultiplier);
  }, [formData.startTime, formData.endTime, formData.participants]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Required fields validation
    if (!formData.date) {
      newErrors.date = validationT('required');
    }
    if (!formData.startTime) {
      newErrors.startTime = validationT('required');
    }
    if (!formData.endTime) {
      newErrors.endTime = validationT('required');
    }
    if (!formData.contactName) {
      newErrors.contactName = validationT('required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.contactEmail) {
      newErrors.contactEmail = validationT('required');
    } else if (!emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = validationT('email');
    }

    // Phone validation (Norwegian format)
    const phoneRegex = locale === 'nb-NO'
      ? /^(\+47)?[0-9]{8}$/
      : /^[0-9]{10,}$/;
    if (!formData.contactPhone) {
      newErrors.contactPhone = validationT('required');
    } else if (!phoneRegex.test(formData.contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = validationT('phone');
    }

    // Time validation
    if (formData.startTime && formData.endTime) {
      const start = new Date(`1970-01-01T${formData.startTime}`);
      const end = new Date(`1970-01-01T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = validationT('end_time_after_start');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validationT, locale]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format phone number before submission
      const formattedData = {
        ...formData,
        contactPhone: formatPhoneNumber(formData.contactPhone),
      };

      await onSubmit?.(formattedData);

      // Show success message (would typically use a toast/notification system)
      alert(bookingT('create.success'));

      // Reset form
      setFormData({
        facilityId,
        date: '',
        startTime: '',
        endTime: '',
        participants: 1,
        description: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      });
      setErrors({});
    } catch (error) {
      // Show error message
      alert(bookingT('create.error'));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit, formatPhoneNumber, bookingT, facilityId]);

  // Handle input changes
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // Language switcher
  const handleLanguageSwitch = useCallback(() => {
    const newLang = i18n.language === 'nb-NO' ? 'en' : 'nb-NO';
    i18n.changeLanguage(newLang);
  }, [i18n]);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      {/* Language Switcher */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleLanguageSwitch}
          className="h-10 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          aria-label={commonT('actions.switch_language')}
        >
          {i18n.language === 'nb-NO' ? '🇬🇧 English' : '🇳🇴 Norsk'}
        </button>
      </div>

      {/* Form Title with Role Context */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {roleT('create.title')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {bookingT('create.date')} *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className={`h-14 w-full px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          {errors.date && (
            <p id="date-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.date}
            </p>
          )}
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {bookingT('create.start_time')} *
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleInputChange}
              className={`h-14 w-full px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startTime ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.startTime}
            />
            {errors.startTime && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.startTime}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {bookingT('create.end_time')} *
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleInputChange}
              className={`h-14 w-full px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endTime ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.endTime}
            />
            {errors.endTime && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.endTime}
              </p>
            )}
          </div>
        </div>

        {/* Participants */}
        <div>
          <label
            htmlFor="participants"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {bookingT('create.participants')}
          </label>
          <input
            id="participants"
            name="participants"
            type="number"
            min="1"
            max="100"
            value={formData.participants}
            onChange={handleInputChange}
            className="h-14 w-full px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {bookingT('create.description')}
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-describedby="description-help"
          />
          <p id="description-help" className="mt-2 text-sm text-gray-500">
            {validationT('max_length', { count: 500 })}
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {bookingT('create.contact_info')}
          </h3>

          {/* Name */}
          <div>
            <label
              htmlFor="contactName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {commonT('fields.name')} *
            </label>
            <input
              id="contactName"
              name="contactName"
              type="text"
              value={formData.contactName}
              onChange={handleInputChange}
              className={`h-14 w-full px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contactName ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.contactName}
            />
            {errors.contactName && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.contactName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="contactEmail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {commonT('fields.email')} *
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleInputChange}
              className={`h-14 w-full px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contactEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.contactEmail}
            />
            {errors.contactEmail && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.contactEmail}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="contactPhone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {commonT('fields.phone')} *
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={handleInputChange}
              placeholder={locale === 'nb-NO' ? '12345678' : '1234567890'}
              className={`h-14 w-full px-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contactPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.contactPhone}
            />
            {errors.contactPhone && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.contactPhone}
              </p>
            )}
          </div>
        </div>

        {/* Price Summary */}
        {calculatedPrice > 0 && (
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {bookingT('pricing.summary')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{bookingT('pricing.subtotal')}</span>
                <span className="font-medium">{formatCurrency(calculatedPrice * 0.8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{bookingT('pricing.vat')}</span>
                <span className="font-medium">{formatCurrency(calculatedPrice * 0.2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold">{bookingT('pricing.total')}</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(calculatedPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Role-specific information */}
        {userRole === 'case_handler' && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {roleT('permissions.can_approve')}
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            aria-label={bookingT('create.submit')}
          >
            {isSubmitting ? commonT('status.saving') : bookingT('create.submit')}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                facilityId,
                date: '',
                startTime: '',
                endTime: '',
                participants: 1,
                description: '',
                contactName: '',
                contactEmail: '',
                contactPhone: '',
              });
              setErrors({});
            }}
            className="h-12 px-6 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            aria-label={commonT('actions.cancel')}
          >
            {commonT('actions.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};