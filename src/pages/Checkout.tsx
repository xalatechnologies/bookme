"use client";

// External libraries
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Edit3,
  Plus,
  Lock,
  FileText,
  AlertCircle,
  Check,
  Info,
  ExternalLink,
  Users,
  Settings,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";

// Internal libraries/utilities
import { useCart } from "@/contexts/hooks";
import { useUserProfile } from "@/contexts/hooks";
import { useAuth } from "@/contexts/hooks/useAuth";
import { GlobalHeader } from "@/components/layouts/PublicLayout/GlobalHeader";
import { useCreateBooking } from "@/services/supabase/bookings.service";
import { supabase } from '@/lib/clients/supabase';
import { facilitiesService } from '@/services/supabase/facilities.service';

// UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Types
import type { ISelectedTimeSlot } from "@/components/features/bookings/types";

/**
 * Professional checkout page component
 *
 * Provides a complete, trustworthy checkout experience with:
 * - Clear step progression
 * - Trust signals and security indicators
 * - Editable user information
 * - Detailed booking information
 * - Add-ons and upsells
 * - Multiple payment methods with explanations
 * - Sticky pricing summary
 * - Consent and terms
 * - Mobile optimization
 *
 * @returns JSX.Element
 */
export const Checkout = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { items, totalPrice, clearCart, removeItem } = useCart();
  const { profile } = useUserProfile();
  const { t, i18n } = useTranslation(["common", "checkout", "bookings"]);
  const createBookingMutation = useCreateBooking();
  const currentLocale = i18n.language === "en" ? "en-US" : "nb-NO";

  // State management - Initialize from sessionStorage for returning users
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(() => {
    return sessionStorage.getItem('checkout_paymentMethod') || "";
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editingInfo, setEditingInfo] = useState<boolean>(false);
  const [discountCode, setDiscountCode] = useState<string>(() => {
    return sessionStorage.getItem('checkout_discountCode') || "";
  });
  const [discountApplied, setDiscountApplied] = useState<boolean>(() => {
    return sessionStorage.getItem('checkout_discountApplied') === 'true';
  });
  const [addons, setAddons] = useState<Record<string, boolean>>(() => {
    const saved = sessionStorage.getItem('checkout_addons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });
  const [consents, setConsents] = useState(() => {
    const saved = sessionStorage.getItem('checkout_consents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { terms: false, cancellation: false, privacy: false };
      }
    }
    return { terms: false, cancellation: false, privacy: false };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    userInfo: true,
    bookingDetails: true,
    addons: false,
    paymentMethods: true,
  });

  // Booking details editing state
  const [editingBookingDetails, setEditingBookingDetails] =
    useState<boolean>(false);

  // Editable user info - Initialize from sessionStorage or profile
  const [userInfo, setUserInfo] = useState(() => {
    // Try to restore from sessionStorage first (for returning from login)
    const saved = sessionStorage.getItem('checkout_userInfo');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Ignore parse errors and use profile data
      }
    }
    return {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      organizationName: "",
      organizationNumber: "",
      invoiceReference: "",
      projectCode: "",
    };
  });

  // Add-ons with pricing and icons
  const availableAddons = [
    {
      id: "extra-time",
      name: t("checkout:addons.extra_time.name", "Ekstra tid"),
      price: 200,
      description: t("checkout:addons.extra_time.description", "Per 30 min"),
      icon: Clock,
      details: t(
        "checkout:addons.extra_time.details",
        "Forleng bookingen med 30 minutter"
      ),
    },
    {
      id: "equipment",
      name: t("checkout:addons.equipment.name", "Utstyr"),
      price: 150,
      description: t(
        "checkout:addons.equipment.description",
        "Ballnett, musikkanlegg"
      ),
      icon: Settings,
      details: t(
        "checkout:addons.equipment.details",
        "Inkluderer ballnett, musikkanlegg og annet utstyr"
      ),
    },
    {
      id: "janitor",
      name: t("checkout:addons.janitor.name", "Vaktmesterhjelp"),
      price: 300,
      description: t("checkout:addons.janitor.description", "Rigg/nedrigg"),
      icon: Users,
      details: t(
        "checkout:addons.janitor.details",
        "Hjelp med oppsett og nedrigg av utstyr"
      ),
    },
    {
      id: "security",
      name: t("checkout:addons.security.name", "Sikkerhet"),
      price: 500,
      description: t(
        "checkout:addons.security.description",
        "Vaktmester på stedet"
      ),
      icon: Shield,
      details: t(
        "checkout:addons.security.details",
        "Vaktmester til stede under hele arrangementet"
      ),
    },
  ];

  /**
   * Save checkout state to sessionStorage before redirecting to login
   */
  const saveCheckoutState = useCallback(() => {
    try {
      sessionStorage.setItem('checkout_userInfo', JSON.stringify(userInfo));
      sessionStorage.setItem('checkout_paymentMethod', selectedPaymentMethod);
      sessionStorage.setItem('checkout_discountCode', discountCode);
      sessionStorage.setItem('checkout_discountApplied', String(discountApplied));
      sessionStorage.setItem('checkout_addons', JSON.stringify(addons));
      sessionStorage.setItem('checkout_consents', JSON.stringify(consents));
    } catch (error) {
      console.error('Failed to save checkout state:', error);
    }
  }, [userInfo, selectedPaymentMethod, discountCode, discountApplied, addons, consents]);

  /**
   * Clear saved checkout state from sessionStorage
   */
  const clearCheckoutState = useCallback(() => {
    try {
      sessionStorage.removeItem('checkout_userInfo');
      sessionStorage.removeItem('checkout_paymentMethod');
      sessionStorage.removeItem('checkout_discountCode');
      sessionStorage.removeItem('checkout_discountApplied');
      sessionStorage.removeItem('checkout_addons');
      sessionStorage.removeItem('checkout_consents');
    } catch (error) {
      console.error('Failed to clear checkout state:', error);
    }
  }, []);

  /**
   * Check authentication and redirect to login if necessary
   * This effect runs on mount and when user authentication changes
   */
  useEffect(() => {
    // If user is not authenticated and has items in cart
    if (!user && items.length > 0) {
      // Save current checkout state
      saveCheckoutState();
      
      // Redirect to login with return URL
      navigate('/login?type=user&returnUrl=/checkout', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
    
    // Clear saved state after successful login (only once)
    if (user && location.state?.fromLogin) {
      // Clear the state flag to prevent re-clearing
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [user, items.length, navigate, location, saveCheckoutState]);

  /**
   * Auto-save checkout state when it changes (for page refreshes)
   */
  useEffect(() => {
    if (user) {
      saveCheckoutState();
    }
  }, [user, saveCheckoutState]);

  /**
   * Update user info when profile loads (after login or profile refresh)
   * Always auto-fill from profile unless user has manually edited fields
   */
  useEffect(() => {
    // Check if this is a fresh load (not returning from login with saved state)
    const hasSavedState = sessionStorage.getItem('checkout_userInfo');
    
    // Only auto-fill if:
    // 1. User is logged in
    // 2. Profile data is available
    // 3. Either no saved state OR coming back from login (location.state.fromLogin)
    if (user && profile.email && (!hasSavedState || location.state?.fromLogin)) {
      console.log('Auto-filling user info from profile:', profile);
      
      const updatedInfo = {
        firstName: profile.firstName || user.user_metadata?.firstName || "",
        lastName: profile.lastName || user.user_metadata?.lastName || "",
        email: user.email || profile.email || "",
        phone: profile.phone || user.user_metadata?.phone || "",
        address: profile.address || user.user_metadata?.address || "",
        organizationName: "",
        organizationNumber: "",
        invoiceReference: "",
        projectCode: "",
      };
      
      setUserInfo(updatedInfo);
      
      // Clear the fromLogin flag after auto-fill
      if (location.state?.fromLogin) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [profile, user, location.state, navigate, location.pathname]);

  /**
   * Calculate pricing with add-ons and discounts
   * Uses existing cart pricing (which already includes VAT) and adds add-ons
   */
  const pricing = useMemo(() => {
    // totalPrice from cart already includes VAT, so we need to extract it
    const totalWithVat = totalPrice;
    const vatAmount = Math.round(totalWithVat * 0.2); // 20% of total = 25% VAT
    const basePriceExcludingVat = totalWithVat - vatAmount;

    const addonPrice = Object.entries(addons).reduce(
      (total, [id, selected]) => {
        if (selected) {
          const addon = availableAddons.find((a) => a.id === id);
          return total + (addon?.price || 0);
        }
        return total;
      },
      0
    );

    const addonPriceWithVat = Math.round(addonPrice * 1.25); // Add VAT to add-ons
    const subtotal = totalWithVat + addonPriceWithVat;
    const discountAmount = discountApplied ? Math.round(subtotal * 0.1) : 0; // 10% discount
    const finalTotal = subtotal - discountAmount;

    return {
      basePriceExcludingVat,
      basePriceWithVat: totalWithVat,
      addonPrice,
      addonPriceWithVat,
      subtotal,
      discountAmount,
      vatAmount: vatAmount + Math.round(addonPrice * 0.25), // VAT from base + add-ons
      total: finalTotal,
    };
  }, [totalPrice, addons, discountApplied]);

  /**
   * Format date for display
   */
  const formatDate = useCallback(
    (date: Date | string | number): string => {
      try {
        let dateObj: Date;

        if (date instanceof Date) {
          dateObj = date;
        } else if (typeof date === "string") {
          dateObj = new Date(date);
        } else if (typeof date === "number") {
          dateObj = new Date(date);
        } else {
          return "Ugyldig dato";
        }

        if (isNaN(dateObj.getTime())) {
          return t("checkout:labels.invalid_date", "Ugyldig dato");
        }

        return new Intl.DateTimeFormat(currentLocale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(dateObj);
      } catch (error) {
        void error; // Error handled by returning fallback message
        return t("checkout:labels.invalid_date", "Ugyldig dato");
      }
    },
    [currentLocale, t]
  );

  /**
   * Format time for display
   */
  const formatTime = useCallback(
    (timeSlot: string): string => {
      if (!timeSlot || typeof timeSlot !== "string") {
        return t("checkout:labels.invalid_time", "Ugyldig tid");
      }
      return timeSlot.replace("-", " - ");
    },
    [t]
  );

  /**
   * Calculate time range for multiple time slots
   *
   * @param timeSlots - Array of time slots
   * @returns Formatted time range string
   */
  const calculateTimeRange = useCallback(
    (timeSlots: readonly ISelectedTimeSlot[]): string => {
      if (!timeSlots || timeSlots.length === 0) {
        return t("checkout:labels.no_time", "Ingen tid");
      }

      if (timeSlots.length === 1) {
        return formatTime(timeSlots[0].timeSlot);
      }

      // For multiple slots, calculate the total time range
      // Sort slots by time to ensure correct order
      const sortedSlots = [...timeSlots].sort((a, b) => {
        const timeA = a.timeSlot.split("-")[0];
        const timeB = b.timeSlot.split("-")[0];
        return timeA.localeCompare(timeB);
      });

      const startTime = sortedSlots[0].timeSlot.split("-")[0];
      const lastSlot = sortedSlots[sortedSlots.length - 1];
      const endTime = lastSlot.timeSlot.split("-")[1];

      return `${startTime} - ${endTime}`;
    },
    [formatTime]
  );

  /**
   * Handle discount code application
   */
  const handleDiscountCode = useCallback(() => {
    if (discountCode.toLowerCase() === "welcome10") {
      setDiscountApplied(true);
      setErrors((prev) => ({ ...prev, discount: "" }));
    } else {
      setErrors((prev) => ({
        ...prev,
        discount: t("checkout:errors.invalid_discount", "Ugyldig rabattkode"),
      }));
    }
  }, [discountCode]);

  /**
   * Handle addon toggle
   */
  const toggleAddon = useCallback((addonId: string) => {
    setAddons((prev) => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  }, []);

  /**
   * Handle consent change
   */
  const handleConsentChange = useCallback((consent: keyof typeof consents) => {
    setConsents((prev) => ({
      ...prev,
      [consent]: !prev[consent],
    }));
  }, []);

  /**
   * Toggle section expansion
   */
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  /**
   * Handle booking details edit
   */
  const handleBookingDetailsEdit = useCallback(() => {
    setEditingBookingDetails(!editingBookingDetails);
  }, [editingBookingDetails]);

  /**
   * Handle booking details save
   */
  const handleBookingDetailsSave = useCallback(() => {
    // TODO: Implement save functionality when backend is available
    setEditingBookingDetails(false);
    // For now, just show a success message
    // toast.success("Bookingdetaljer oppdatert!");
  }, []);

  /**
   * Validate form before payment
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPaymentMethod) {
      newErrors.payment = t(
        "checkout:errors.select_payment_method",
        "Velg en betalingsmetode"
      );
    }

    // Check all consents and provide detailed error messages
    const missingConsents: string[] = [];
    
    if (!consents.terms) {
      missingConsents.push(t(
        "checkout:errors.terms_short",
        "vilkårene"
      ));
    }

    if (!consents.cancellation) {
      missingConsents.push(t(
        "checkout:errors.cancellation_short",
        "avbestillingsreglene"
      ));
    }

    if (!consents.privacy) {
      missingConsents.push(t(
        "checkout:errors.privacy_short",
        "personvern"
      ));
    }

    if (missingConsents.length > 0) {
      newErrors.consents = t(
        "checkout:errors.must_accept_all",
        `Du må godta: ${missingConsents.join(", ")}`
      );
    }

    setErrors(newErrors);
    
    // Scroll to error if validation fails
    if (Object.keys(newErrors).length > 0) {
      console.error('Validation failed:', newErrors);
      // Scroll to the first error
      setTimeout(() => {
        const errorElement = document.querySelector('[class*="text-red"]');
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    
    return Object.keys(newErrors).length === 0;
  }, [selectedPaymentMethod, consents, t]);

  /**
   * Generate next booking number (1-99999, then restart)
   */
  const getNextBookingNumber = useCallback((): number => {
    try {
      const lastNumber = parseInt(
        localStorage.getItem("lastBookingNumber") || "0"
      );
      const nextNumber = lastNumber >= 99999 ? 1 : lastNumber + 1;
      localStorage.setItem("lastBookingNumber", nextNumber.toString());
      return nextNumber;
    } catch (error) {
      void error; // Error handled by returning default booking number
      return 1;
    }
  }, []);

  /**
   * Handle payment completion
   */
  const handleCompletePayment = useCallback(async (): Promise<void> => {
    // Auto-select payment method if none selected
    if (!selectedPaymentMethod) {
      setSelectedPaymentMethod("card");
    }

    if (!validateForm()) {
      return;
    }

    // User should already be logged in at this point due to redirect
    // But add a safety check just in case
    if (!user) {
      // This shouldn't happen, but if it does, save state and redirect
      saveCheckoutState();
      navigate('/login?type=user&returnUrl=/checkout', { 
        replace: true,
        state: { from: location.pathname }
      });
      return;
    }

    // Debug: Log cart items to see what facility IDs we have
    console.log('Cart items:', items);
    items.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        id: item.id,
        facilityId: item.facilityId,
        facilityIdType: typeof item.facilityId,
        facilityIdLength: typeof item.facilityId === 'string' ? item.facilityId.length : 'N/A',
        facilityName: item.facilityName,
        timeSlots: item.timeSlots
      });
      
      // Check for invalid IDs
      if (item.id && typeof item.id === 'string' && item.id.length > 10 && !item.id.includes('-')) {
        console.warn('Potential invalid ID in cart item:', item.id);
      }
    });

    // Check user authentication status
    console.log('Current user:', user);
    console.log('User ID:', user?.id);
    
    // Check Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session);
    if (sessionError) {
      console.error('Session error:', sessionError);
    }

    setIsProcessing(true);

    try {
      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      const { data: test, error: testError } = await supabase
        .from('facilities')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      console.log('Supabase connection test successful');
      
      // Create actual bookings in the database
      const bookingPromises = items.map(async (item) => {
        // Validate that facilityId is a proper UUID
        if (!item.facilityId || typeof item.facilityId !== 'string' || item.facilityId.length !== 36) {
          console.error('Invalid facility ID:', item.facilityId);
          throw new Error(`Invalid facility ID: ${item.facilityId}. Expected a valid UUID.`);
        }

        // Fetch facility details to get the correct org_id
        let orgId = "00000000-0000-0000-0000-000000000000";
        try {
          console.log('Fetching facility details for:', item.facilityId);
          const facility = await facilitiesService.getById(item.facilityId);
          console.log('Facility details:', facility);
          orgId = facility.org_id || orgId;
        } catch (facilityError) {
          console.warn('Failed to fetch facility details, using default org_id:', facilityError);
        }

        // For recurring bookings, create one booking per time slot
        if (
          item.bookingType === "recurring" &&
          item.timeSlots &&
          item.timeSlots.length > 0
        ) {
          return Promise.all(
            item.timeSlots.map(async (slot) => {
              // Normalize date to YYYY-MM-DD
              const d =
                typeof slot.date === "string"
                  ? new Date(slot.date)
                  : (slot.date as Date);
              const bookingDate = `${d.getFullYear()}-${String(
                d.getMonth() + 1
              ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

              // Parse time slot
              const [startTime, endTime] = slot.timeSlot.split("-");

              // Calculate start and end datetime
              const startDateTime = new Date(`${bookingDate}T${startTime.trim()}:00`);
              const endDateTime = new Date(`${bookingDate}T${endTime.trim()}:00`);

              // Calculate duration in minutes
              const duration = slot.duration ?? 60;

              // Log the booking data before creating
              const bookingData = {
                user_id: user.id,
                facility_id: item.facilityId,
                starts_at: startDateTime.toISOString(),
                ends_at: endDateTime.toISOString(),
                total_cents: Math.round(item.pricing?.finalPrice / (item.timeSlots.length || 1) * 100),
                status: "pending" as const,
                notes: item.purpose || "Booking",
                is_recurring: true,
                // Explicitly set group_id to null to avoid any accidental assignment
                group_id: null,
                org_id: orgId,
                currency: "NOK",
                // Fix zone_id - ensure it's either a valid UUID or null
                zone_id: item.zoneId && typeof item.zoneId === 'string' && item.zoneId.length === 36 ? item.zoneId : null,
              };
              
              // Check for invalid IDs in booking data
              for (const [key, value] of Object.entries(bookingData)) {
                if (typeof value === 'string' && value.length > 10 && !value.includes('-') && key.includes('id')) {
                  console.warn(`Invalid ID detected in booking data field ${key}:`, value);
                }
              }
              
              console.log('Creating recurring booking:', bookingData);
              
              // Create booking in database
              return createBookingMutation.mutateAsync(bookingData);
            })
          );
        }

        // For single bookings, create one booking
        if (item.timeSlots && item.timeSlots.length > 0) {
          // Validate facilityId again
          if (!item.facilityId || typeof item.facilityId !== 'string' || item.facilityId.length !== 36) {
            console.error('Invalid facility ID:', item.facilityId);
            throw new Error(`Invalid facility ID: ${item.facilityId}. Expected a valid UUID.`);
          }

          // Use the first time slot for single bookings
          const slot = item.timeSlots[0];
          
          // Normalize date to YYYY-MM-DD
          const d =
            typeof slot.date === "string"
              ? new Date(slot.date)
              : (slot.date as Date);
          const bookingDate = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

          // Calculate total duration for all time slots in minutes
          const totalDurationMinutes = item.timeSlots.reduce(
            (total, s) => total + (s.duration ?? 60),
            0
          );

          // For single bookings with multiple time slots, we'll use the first time slot
          // and calculate the end time based on total duration
          const [startTime] = slot.timeSlot.split("-");

          // Calculate start and end datetime
          const startDateTime = new Date(`${bookingDate}T${startTime.trim()}:00`);
          
          // Calculate end time based on total duration
          const endDateTime = new Date(startDateTime.getTime() + (totalDurationMinutes * 60 * 1000));

          // Log the booking data before creating
          const bookingData = {
            user_id: user.id,
            facility_id: item.facilityId,
            starts_at: startDateTime.toISOString(),
            ends_at: endDateTime.toISOString(),
            total_cents: Math.round(item.pricing?.finalPrice * 100),
            status: "pending" as const,
            notes: item.purpose || "Booking",
            is_recurring: false,
            // Explicitly set group_id to null to avoid any accidental assignment
            group_id: null,
            org_id: orgId,
            currency: "NOK",
            // Fix zone_id - ensure it's either a valid UUID or null
            zone_id: item.zoneId && typeof item.zoneId === 'string' && item.zoneId.length === 36 ? item.zoneId : null,
          };
          
          // Check for invalid IDs in booking data
          for (const [key, value] of Object.entries(bookingData)) {
            if (typeof value === 'string' && value.length > 10 && !value.includes('-') && key.includes('id')) {
              console.warn(`Invalid ID detected in booking data field ${key}:`, value);
            }
          }
          
          console.log('Creating single booking:', bookingData);

          // Create booking in database
          return createBookingMutation.mutateAsync(bookingData);
        }

        // Fallback for bookings without time slots
        // Validate facilityId again
        if (!item.facilityId || typeof item.facilityId !== 'string' || item.facilityId.length !== 36) {
          console.error('Invalid facility ID:', item.facilityId);
          throw new Error(`Invalid facility ID: ${item.facilityId}. Expected a valid UUID.`);
        }

        // Fetch facility details to get the correct org_id (fallback case)
        let fallbackOrgId = "00000000-0000-0000-0000-000000000000";
        try {
          console.log('Fetching facility details for fallback case:', item.facilityId);
          const facility = await facilitiesService.getById(item.facilityId);
          console.log('Facility details (fallback):', facility);
          fallbackOrgId = facility.org_id || fallbackOrgId;
        } catch (facilityError) {
          console.warn('Failed to fetch facility details for fallback, using default org_id:', facilityError);
        }

        const today = new Date();
        const bookingDate = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const startDateTime = new Date(`${bookingDate}T12:00:00`);
        const endDateTime = new Date(`${bookingDate}T13:00:00`);

        // Log the booking data before creating
        const bookingData = {
          user_id: user.id,
          facility_id: item.facilityId,
          starts_at: startDateTime.toISOString(),
          ends_at: endDateTime.toISOString(),
          total_cents: Math.round(item.pricing?.finalPrice * 100),
          status: "pending" as const,
          notes: item.purpose || "Booking",
          is_recurring: false,
          // Explicitly set group_id to null to avoid any accidental assignment
          group_id: null,
          org_id: fallbackOrgId,
          currency: "NOK",
          // Fix zone_id - ensure it's either a valid UUID or null
          zone_id: item.zoneId && typeof item.zoneId === 'string' && item.zoneId.length === 36 ? item.zoneId : null,
        };
        
        // Check for invalid IDs in booking data
        for (const [key, value] of Object.entries(bookingData)) {
          if (typeof value === 'string' && value.length > 10 && !value.includes('-') && key.includes('id')) {
            console.warn(`Invalid ID detected in booking data field ${key}:`, value);
          }
        }
        
        console.log('Creating fallback booking:', bookingData);

        return createBookingMutation.mutateAsync(bookingData);
      });

      // Wait for all bookings to be created
      console.log('Waiting for all bookings to be created...');
      const results = await Promise.all(bookingPromises.flat());
      console.log('All bookings created successfully:', results);

      // Clear saved checkout state after successful payment
      clearCheckoutState();
      
      // Clear cart and redirect
      clearCart();
      navigate("/user/bookings?success=true");
    } catch (error) {
      console.error("Error creating bookings:", error);
      setErrors({
        payment: t(
          "checkout:errors.payment_failed",
          "Payment failed. Please try again or choose a different method. Error: " + (error instanceof Error ? error.message : String(error))
        ),
      });
      setIsProcessing(false);
    }
  }, [
    validateForm,
    clearCart,
    navigate,
    selectedPaymentMethod,
    items,
    user,
    profile,
    createBookingMutation
  ]);

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t("checkout:empty.title", "Ingen bookinger å betale for")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t(
                  "checkout:empty.description",
                  "Du har ingen aktive bookinger i handlekurven."
                )}
              </p>
              <Button onClick={() => navigate("/facilities")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("checkout:empty.back_to_facilities", "Tilbake til lokaler")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Step Indicator */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <span className="text-sm font-semibold text-green-600">
                    {t("checkout:steps.details", "Velg detaljer")}
                  </span>
                  <p className="text-xs text-gray-500">
                    {t("checkout:steps.completed", "Fullført")}
                  </p>
                </div>
              </div>
              <div className="w-20 h-1 bg-green-200 rounded-full relative">
                <div className="w-full h-full bg-green-600 rounded-full"></div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  2
                </div>
                <div className="ml-3">
                  <span className="text-sm font-semibold text-blue-600">
                    {t("checkout:steps.payment", "Betaling")}
                  </span>
                  <p className="text-xs text-gray-500">
                    {t("checkout:steps.active", "Aktivt trinn")}
                  </p>
                </div>
              </div>
              <div className="w-20 h-1 bg-gray-200 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="ml-3">
                  <span className="text-sm font-semibold text-gray-400">
                    {t("checkout:steps.receipt", "Kvittering")}
                  </span>
                  <p className="text-xs text-gray-400">
                    {t("checkout:steps.next", "Neste")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* User Information */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("userInfo")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChevronRight
                      className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${
                        expandedSections.userInfo ? "rotate-90" : ""
                      }`}
                    />
                    <div>
                      <CardTitle className="text-lg">
                        {t("checkout:sections.your_info", "Dine opplysninger")}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {t(
                          "checkout:sections.verify_info",
                          "Kontrollér at opplysningene er riktige"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Clear saved state when user manually edits
                        if (!editingInfo) {
                          sessionStorage.removeItem('checkout_userInfo');
                        }
                        setEditingInfo(!editingInfo);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {editingInfo
                        ? t("common:actions.done", "Ferdig")
                        : t("common:actions.edit", "Endre")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedSections.userInfo && (
                <CardContent className="space-y-4">
                  {editingInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">
                          {t("checkout:fields.first_name", "Fornavn")}
                        </Label>
                        <Input
                          id="firstName"
                          value={userInfo.firstName}
                          onChange={(e) =>
                            setUserInfo((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">
                          {t("checkout:fields.last_name", "Etternavn")}
                        </Label>
                        <Input
                          id="lastName"
                          value={userInfo.lastName}
                          onChange={(e) =>
                            setUserInfo((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">
                          {t("checkout:fields.email", "E-post")}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={userInfo.email}
                          onChange={(e) =>
                            setUserInfo((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">
                          {t("checkout:fields.phone", "Telefon")}
                        </Label>
                        <Input
                          id="phone"
                          value={userInfo.phone}
                          onChange={(e) =>
                            setUserInfo((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="address">
                          {t("checkout:fields.address", "Adresse")}
                        </Label>
                        <Input
                          id="address"
                          value={userInfo.address}
                          onChange={(e) =>
                            setUserInfo((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <User className="h-5 w-5 mr-3 text-gray-500" />
                        <span>
                          {userInfo.firstName} {userInfo.lastName}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                        <span>{userInfo.email}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Clock className="h-5 w-5 mr-3 text-gray-500" />
                        <span>{userInfo.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                        <span>{userInfo.address}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("bookingDetails")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChevronRight
                      className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${
                        expandedSections.bookingDetails ? "rotate-90" : ""
                      }`}
                    />
                    <div>
                      <CardTitle className="text-lg">
                        {t(
                          "checkout:sections.booking_details",
                          "Bookingdetaljer"
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {t(
                          "checkout:sections.verify_booking",
                          "Kontrollér dato, tid og deltakere"
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookingDetailsEdit();
                    }}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {editingBookingDetails
                      ? t("common:actions.cancel", "Avbryt")
                      : t("common:actions.edit", "Endre")}
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.bookingDetails && (
                <CardContent className="space-y-4">
                  {editingBookingDetails ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          {t("checkout:edit.title", "Rediger bookingdetaljer")}
                        </h4>
                        <p className="text-sm text-blue-700 mb-4">
                          {t(
                            "checkout:edit.description",
                            "Du kan endre formål, antall deltakere og aktivitetstype for dine bookinger."
                          )}
                        </p>
                        <div className="space-y-4">
                          {items.map((item, index) => (
                            <div
                              key={item.id}
                              className="bg-white rounded-lg p-4 border border-blue-200"
                            >
                              <h5 className="font-medium text-gray-900 mb-3">
                                {item.facilityName}
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`purpose-${index}`}>
                                    {t("checkout:fields.purpose", "Formål")}
                                  </Label>
                                  <Input
                                    id={`purpose-${index}`}
                                    defaultValue={item.purpose || ""}
                                    placeholder={t(
                                      "checkout:placeholders.purpose",
                                      "Beskriv formålet med bookingen"
                                    )}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`attendees-${index}`}>
                                    {t(
                                      "checkout:fields.attendees",
                                      "Antall deltakere"
                                    )}
                                  </Label>
                                  <Input
                                    id={`attendees-${index}`}
                                    type="number"
                                    min="1"
                                    defaultValue={item.attendees || 1}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`activity-${index}`}>
                                    {t(
                                      "checkout:fields.activity_type",
                                      "Aktivitetstype"
                                    )}
                                  </Label>
                                  <Input
                                    id={`activity-${index}`}
                                    defaultValue={item.activityType || ""}
                                    placeholder={t(
                                      "checkout:placeholders.activity_type",
                                      "F.eks. fotball, møte, fest"
                                    )}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`additional-${index}`}>
                                    {t(
                                      "checkout:fields.additional_info",
                                      "Tilleggsinformasjon"
                                    )}
                                  </Label>
                                  <Input
                                    id={`additional-${index}`}
                                    defaultValue={item.additionalInfo || ""}
                                    placeholder={t(
                                      "checkout:placeholders.additional_info",
                                      "Spesielle ønsker eller krav"
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={handleBookingDetailsEdit}
                          >
                            {t("common:actions.cancel", "Avbryt")}
                          </Button>
                          <PrimaryButton
                            onClick={handleBookingDetailsSave}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t("common:actions.save", "Lagre endringer")}
                          </PrimaryButton>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {item.facilityName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {item.zoneName}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {item.bookingType === "recurring"
                                ? t("checkout:labels.recurring", "Gjentakende")
                                : t("checkout:labels.single", "Enkelt")}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {item.timeSlots && item.timeSlots.length > 0
                                  ? formatDate(item.timeSlots[0].date)
                                  : t("checkout:labels.no_date", "Ingen dato")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>
                                {item.timeSlots && item.timeSlots.length > 0
                                  ? calculateTimeRange(item.timeSlots)
                                  : t("checkout:labels.no_time", "Ingen tid")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {item.timeSlots && item.timeSlots.length > 0
                                  ? (() => {
                                      const totalHours =
                                        item.timeSlots.reduce(
                                          (total, slot) =>
                                            total + (slot.duration ?? 60),
                                          0
                                        ) / 60;
                                      return totalHours === 1
                                        ? `1 time`
                                        : `${totalHours} timer`;
                                    })()
                                  : `0 timer`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{item.attendees || 0} {t("checkout:fields.attendees_unit", "deltakere")}</span>
                            </div>
                          </div>

                          {item.purpose && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600">
                                {t("checkout:labels.purpose", "Formål")}:
                              </p>
                              <p className="text-sm">{item.purpose}</p>
                            </div>
                          )}

                          {/* Show period for recurring bookings */}
                          {item.bookingType === "recurring" &&
                            item.timeSlots &&
                            item.timeSlots.length > 1 && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600">
                                  {t("checkout:labels.period", "Periode")}:
                                </p>
                                <p className="text-sm">
                                  {formatDate(item.timeSlots[0].date)} –{" "}
                                  {formatDate(
                                    item.timeSlots[item.timeSlots.length - 1]
                                      .date
                                  )}
                                </p>
                              </div>
                            )}

                          {/* Usage Rules */}
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">
                              {t(
                                "checkout:labels.usage_rules",
                                "Regler for bruk"
                              )}
                            </h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                              <li>
                                •{" "}
                                {t(
                                  "checkout:rules.cleanup_required",
                                  "Renhold etter bruk er påkrevd"
                                )}
                              </li>
                              <li>
                                •{" "}
                                {t(
                                  "checkout:rules.keys_info",
                                  "Nøkler hentes ved inngang 15 min før start"
                                )}
                              </li>
                              <li>
                                •{" "}
                                {t(
                                  "checkout:rules.free_cancellation",
                                  "Avbestilling gratis til 48 timer før start"
                                )}
                              </li>
                              <li>
                                •{" "}
                                {t(
                                  "checkout:rules.no_show_fee",
                                  "Gebyr ved no-show: 50% av leiepris"
                                )}
                              </li>
                            </ul>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Enhanced Payment Methods */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("paymentMethods")}
              >
                <div className="flex items-center">
                  <ChevronRight
                    className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${
                      expandedSections.paymentMethods ? "rotate-90" : ""
                    }`}
                  />
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                      {t("checkout:sections.payment_method", "Betalingsmetode")}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {t(
                        "checkout:sections.payment_method_desc",
                        "Velg hvordan du vil betale for bookingen"
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>
              {expandedSections.paymentMethods && (
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    {/* Credit Card */}
                    <div
                      className={`flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 ${
                        selectedPaymentMethod === "card"
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="card"
                          className="flex items-center cursor-pointer"
                        >
                          <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
                          <span className="font-semibold text-lg">
                            {t("checkout:payment.card", "Kredittkort")}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {t("checkout:labels.recommended", "Anbefalt")}
                          </Badge>
                        </Label>
                        <p className="text-sm text-gray-600 mt-2">
                          {t(
                            "checkout:payment.card_desc",
                            "Trekkes nå. Kvittering på e-post."
                          )}
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
                              V
                            </div>
                            <span className="text-xs text-gray-500">Visa</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-5 bg-red-600 rounded text-white text-xs font-bold flex items-center justify-center">
                              M
                            </div>
                            <span className="text-xs text-gray-500">
                              Mastercard
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs font-bold flex items-center justify-center">
                              A
                            </div>
                            <span className="text-xs text-gray-500">AmEx</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Payment */}
                    <div
                      className={`flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 ${
                        selectedPaymentMethod === "mobile"
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem
                        value="mobile"
                        id="mobile"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="mobile"
                          className="flex items-center cursor-pointer"
                        >
                          <Smartphone className="h-6 w-6 mr-3 text-green-600" />
                          <span className="font-semibold text-lg">
                            {t("checkout:payment.mobile", "Mobilbetaling")}
                          </span>
                        </Label>
                        <p className="text-sm text-gray-600 mt-2">
                          {t(
                            "checkout:payment.mobile_desc",
                            "Rask og sikker betaling med mobil"
                          )}
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-5 bg-purple-600 rounded text-white text-xs font-bold flex items-center justify-center">
                              V
                            </div>
                            <span className="text-xs text-gray-500">Vipps</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-5 bg-gray-900 rounded text-white text-xs font-bold flex items-center justify-center">
                              A
                            </div>
                            <span className="text-xs text-gray-500">
                              Apple Pay
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs font-bold flex items-center justify-center">
                              G
                            </div>
                            <span className="text-xs text-gray-500">
                              Google Pay
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Invoice/EHF */}
                    <div
                      className={`flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 ${
                        selectedPaymentMethod === "invoice"
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem
                        value="invoice"
                        id="invoice"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="invoice"
                          className="flex items-center cursor-pointer"
                        >
                          <Building2 className="h-6 w-6 mr-3 text-orange-600" />
                          <span className="font-semibold text-lg">
                            {t("checkout:payment.invoice", "Faktura/EHF")}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {t(
                              "checkout:labels.business_only",
                              "Kun virksomheter"
                            )}
                          </Badge>
                        </Label>
                        <p className="text-sm text-gray-600 mt-2">
                          {t(
                            "checkout:payment.invoice_desc",
                            "25 dager betalingsfrist. Gebyr 50 kr."
                          )}
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <Shield className="h-3 w-3 mr-1" />
                            <span>ISO 27001</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span>WCAG 2.2 AA</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <FileText className="h-3 w-3 mr-1" />
                            <span>
                              {t(
                                "checkout:payment.ehf_supported",
                                "EHF støttet"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* EHF Fields */}
                  {selectedPaymentMethod === "invoice" && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-4">
                      <h4 className="font-medium text-blue-900">
                        {t("checkout:invoice.title", "Fakturaopplysninger")}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="orgName">
                            {t(
                              "checkout:invoice.org_name",
                              "Organisasjonsnavn"
                            )}
                          </Label>
                          <Input
                            id="orgName"
                            value={userInfo.organizationName}
                            onChange={(e) =>
                              setUserInfo((prev) => ({
                                ...prev,
                                organizationName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="orgNumber">
                            {t(
                              "checkout:invoice.org_number",
                              "Organisasjonsnummer"
                            )}
                          </Label>
                          <Input
                            id="orgNumber"
                            value={userInfo.organizationNumber}
                            onChange={(e) =>
                              setUserInfo((prev) => ({
                                ...prev,
                                organizationNumber: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="invoiceRef">
                            {t("checkout:invoice.reference", "Referanse")}
                          </Label>
                          <Input
                            id="invoiceRef"
                            value={userInfo.invoiceReference}
                            onChange={(e) =>
                              setUserInfo((prev) => ({
                                ...prev,
                                invoiceReference: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="projectCode">
                            {t("checkout:invoice.project_code", "Prosjektkode")}
                          </Label>
                          <Input
                            id="projectCode"
                            value={userInfo.projectCode}
                            onChange={(e) =>
                              setUserInfo((prev) => ({
                                ...prev,
                                projectCode: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.payment && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.payment}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Enhanced Add-ons */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection("addons")}
              >
                <div className="flex items-center">
                  <ChevronRight
                    className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${
                      expandedSections.addons ? "rotate-90" : ""
                    }`}
                  />
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Plus className="h-5 w-5 mr-2 text-blue-600" />
                      {t("checkout:sections.addons", "Tillegg")}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {t(
                        "checkout:sections.addons_desc",
                        "Legg til ekstra tjenester for din booking"
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>
              {expandedSections.addons && (
                <CardContent className="space-y-4">
                  {availableAddons.map((addon) => {
                    const IconComponent = addon.icon;
                    const isSelected = addons[addon.id] || false;

                    return (
                      <div
                        key={addon.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            id={addon.id}
                            checked={isSelected}
                            onCheckedChange={() => toggleAddon(addon.id)}
                            className="h-5 w-5"
                          />
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected ? "bg-blue-100" : "bg-gray-100"
                              }`}
                            >
                              <IconComponent
                                className={`h-5 w-5 ${
                                  isSelected ? "text-blue-600" : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={addon.id}
                                className="font-semibold cursor-pointer text-base"
                              >
                                {addon.name}
                              </Label>
                              <p className="text-sm text-gray-600">
                                {addon.description}
                              </p>
                              <div className="flex items-center mt-1">
                                <Info className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">
                                  {addon.details}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600">
                            {addon.price} kr
                          </span>
                          {isSelected && (
                            <div className="flex items-center text-green-600 text-xs mt-1">
                              <Check className="h-3 w-3 mr-1" />
                              {t("checkout:labels.selected", "Valgt")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right Column: Enhanced Sticky Pricing Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-20 lg:block hidden">
              <Card className="shadow-lg border-2">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="text-xl flex items-center">
                    <CreditCard className="h-6 w-6 mr-2" />
                    {t("checkout:pricing.title", "Prisoversikt")}
                  </CardTitle>
                  <p className="text-blue-100 text-sm">
                    {t(
                      "checkout:pricing.note",
                      "Du blir ikke belastet før bestillingen er bekreftet"
                    )}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {/* Booking Type Breakdown */}
                  {items.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 font-medium">
                          {item.bookingType === "recurring"
                            ? t("checkout:labels.recurring", "Gjentakende")
                            : t("checkout:labels.single", "Enkelt")}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {item.facilityName}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Price breakdown for this booking */}
                      <div className="ml-4 space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {t(
                              "checkout:pricing.price_ex_vat",
                              "Pris (ekskl. MVA)"
                            )}
                          </span>
                          <span className="font-medium">
                            {(() => {
                              // Calculate price excluding VAT for this specific item
                              const itemPriceWithVat =
                                item.pricing?.finalPrice || 0;
                              const itemVatAmount = Math.round(
                                itemPriceWithVat * 0.2
                              ); // 20% of total = 25% VAT
                              const itemPriceExcludingVat =
                                itemPriceWithVat - itemVatAmount;
                              return `${itemPriceExcludingVat.toLocaleString(
                                "nb-NO"
                              )} kr`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {t("checkout:pricing.vat_25", "MVA (25%)")}
                          </span>
                          <span className="font-medium">
                            {(() => {
                              // Calculate VAT for this specific item
                              const itemPriceWithVat =
                                item.pricing?.finalPrice || 0;
                              const itemVatAmount = Math.round(
                                itemPriceWithVat * 0.2
                              ); // 20% of total = 25% VAT
                              return `${itemVatAmount.toLocaleString(
                                "nb-NO"
                              )} kr`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add-ons detailed breakdown */}
                  {pricing.addonPrice > 0 && (
                    <div className="space-y-2 border-t pt-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 font-medium">
                          {t(
                            "checkout:pricing.addons_title",
                            "Tillegg utstyr/tjenester"
                          )}
                        </span>
                      </div>

                      <div className="ml-4 space-y-1 text-sm">
                        {Object.entries(addons).map(([id, selected]) => {
                          if (!selected) return null;
                          const addon = availableAddons.find(
                            (a) => a.id === id
                          );
                          if (!addon) return null;

                          return (
                            <div
                              key={id}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-600">
                                {addon.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <div className="font-medium">
                                    {addon.price.toLocaleString(currentLocale)}{" "}
                                    kr (
                                    {t("checkout:pricing.ex_vat", "ekskl. MVA")}
                                    )
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    +
                                    {(addon.price * 0.25).toLocaleString(
                                      currentLocale
                                    )}{" "}
                                    kr {t("checkout:pricing.vat", "MVA")}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleAddon(id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Discount Code */}
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Input
                        placeholder={t("checkout:pricing.discount_code_placeholder", "Rabattkode")}
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="flex-1 border-2 focus:border-blue-500"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDiscountCode}
                        disabled={!discountCode}
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        {t("checkout:pricing.apply_discount", "Bruk")}
                      </Button>
                    </div>
                    {discountApplied && (
                      <div className="flex items-center text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                        <Check className="h-4 w-4 mr-2" />
                        <span className="font-medium">{t("checkout:pricing.discount_applied", "Rabatt påført!")}</span>
                      </div>
                    )}
                    {errors.discount && (
                      <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                        {errors.discount}
                      </div>
                    )}
                  </div>

                  {/* Discount */}
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3">
                      <span className="text-green-700 font-medium">{t("checkout:pricing.discount", "Rabatt")}</span>
                      <span className="font-bold text-lg text-green-600">
                        -{pricing.discountAmount.toLocaleString("nb-NO")} kr
                      </span>
                    </div>
                  )}

                  {/* Invoice Fee */}
                  {selectedPaymentMethod === "invoice" && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">
                        {t("checkout:pricing.invoice_fee", "Fakturagebyr")}
                      </span>
                      <span className="font-semibold">+50 kr</span>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">
                      {t("checkout:pricing.subtotal_ex_vat", "Sum ekskl. MVA")}
                    </span>
                    <span className="font-medium">
                      {(
                        pricing.basePriceExcludingVat + pricing.addonPrice
                      ).toLocaleString(currentLocale)}{" "}
                      kr
                    </span>
                  </div>

                  {/* VAT */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">
                      {t("checkout:pricing.vat_25", "MVA (25%)")}
                    </span>
                    <span className="font-medium">
                      {pricing.vatAmount.toLocaleString(currentLocale)} kr
                    </span>
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 bg-blue-50 rounded-lg px-4">
                    <span className="text-xl font-bold text-gray-900">
                      {t("checkout:pricing.total_incl_vat", "Totalt inkl. MVA")}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {pricing.total.toLocaleString(currentLocale)} kr
                    </span>
                  </div>

                  {/* Consent Checkboxes - Moved from "Før du betaler" section */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        id="terms"
                        checked={consents.terms}
                        onCheckedChange={() => handleConsentChange("terms")}
                        className="h-5 w-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="terms"
                          className="text-sm cursor-pointer flex items-start"
                        >
                          <span>
                            {t(
                              "checkout:consents.accept_prefix",
                              "Jeg godtar "
                            )}{" "}
                          </span>
                          <a
                            href="/terms"
                            target="_blank"
                            className="text-blue-600 hover:underline mx-1 flex items-center"
                          >
                            {t("checkout:consents.terms", "vilkår for leie")}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Label>
                      </div>
                      {consents.terms && (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-start space-x-4">
                      <Checkbox
                        id="cancellation"
                        checked={consents.cancellation}
                        onCheckedChange={() =>
                          handleConsentChange("cancellation")
                        }
                        className="h-5 w-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="cancellation"
                          className="text-sm cursor-pointer flex items-start"
                        >
                          <span>
                            {t(
                              "checkout:consents.read_prefix",
                              "Jeg har lest "
                            )}{" "}
                          </span>
                          <a
                            href="/cancellation"
                            target="_blank"
                            className="text-blue-600 hover:underline mx-1 flex items-center"
                          >
                            {t(
                              "checkout:consents.cancellation",
                              "avbestillingsreglene"
                            )}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Label>
                      </div>
                      {consents.cancellation && (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-start space-x-4">
                      <Checkbox
                        id="privacy"
                        checked={consents.privacy}
                        onCheckedChange={() => handleConsentChange("privacy")}
                        className="h-5 w-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="privacy"
                          className="text-sm cursor-pointer"
                        >
                          {t(
                            "checkout:consents.privacy",
                            "Jeg samtykker til behandling av personopplysninger for denne bestillingen"
                          )}
                        </Label>
                      </div>
                      {consents.privacy && (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Ready to pay indicator */}
                  {consents.terms &&
                    consents.cancellation &&
                    consents.privacy && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                          <div>
                            <p className="font-semibold text-green-800">
                              {t(
                                "checkout:status.ready_to_pay",
                                "Klar til betaling!"
                              )}
                            </p>
                            <p className="text-sm text-green-700">
                              {t(
                                "checkout:status.all_consents",
                                "Alle samtykker er godtatt."
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {errors.consents && (
                    <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.consents}
                    </div>
                  )}

                  {/* Enhanced Complete Payment Button */}
                  <Button
                    className="w-full h-14 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    disabled={isProcessing}
                    onClick={handleCompletePayment}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        {t(
                          "checkout:actions.processing_payment",
                          "Behandler betaling..."
                        )}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6 mr-3" />
                        {selectedPaymentMethod === "invoice"
                          ? t(
                              "checkout:actions.order_with_invoice",
                              "Bestill med faktura"
                            )
                          : t(
                              "checkout:actions.complete_and_pay",
                              "Fullfør og betal"
                            )}
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Enhanced Trust Signals */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        <span>{t("checkout:trust.ssl", "SSL-kryptert")}</span>
                      </div>
                      <div className="flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        <span>
                          {t(
                            "checkout:trust.secure_payment",
                            "Sikker betaling"
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      {t(
                        "checkout:trust.legal_prefix",
                        "Ved å fullføre godtar du "
                      )}
                      <a
                        href="/terms"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        {t("checkout:trust.terms", "vilkår")}
                      </a>{" "}
                      {t("checkout:trust.and", "og")}{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        {t("checkout:trust.privacy", "personvernerklæring")}
                      </a>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Pricing Summary - Fixed at bottom on mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-bold text-lg">
                  {t("checkout:pricing.title", "Prisoversikt")}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {pricing.total.toLocaleString("nb-NO")} kr
                </div>
              </div>
            </div>

            <PrimaryButton
              className="w-full h-12 text-lg font-bold shadow-lg"
              disabled={isProcessing}
              onClick={handleCompletePayment}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {t(
                    "checkout:actions.processing_payment",
                    "Behandler betaling..."
                  )}
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {selectedPaymentMethod === "invoice"
                    ? t(
                        "checkout:actions.order_with_invoice",
                        "Bestill med faktura"
                      )
                    : t(
                        "checkout:actions.complete_and_pay",
                        "Fullfør og betal"
                      )}
                </>
              )}
            </PrimaryButton>
          </div>
        </div>

        {/* Mobile spacing to prevent content from being hidden behind fixed pricing */}
        <div className="lg:hidden h-24"></div>
      </div>
    </div>
  );
};

export default Checkout;
