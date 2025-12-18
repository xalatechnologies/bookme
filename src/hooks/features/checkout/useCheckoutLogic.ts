import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/contexts/hooks";
import { useUserProfile } from "@/contexts/hooks";
import { useAuth } from "@/contexts/hooks/useAuth";
import { useCreateBooking } from "@/services/supabase/bookings.service";
import { supabase } from '@/lib/clients/supabase';
import { facilitiesService } from '@/services/supabase/facilities.service';
import { Clock, Settings, Users, Shield } from "lucide-react";
import { ISelectedTimeSlot } from "@/components/features/bookings/types";

// User info type
export type UserInfo = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    organizationName: string;
    organizationNumber: string;
    invoiceReference: string;
    projectCode: string;
};

// Add-ons with pricing and icons
export const availableAddons = [
    {
        id: "extra-time",
        name: "Ekstra tid",
        price: 200,
        description: "Per 30 min",
        icon: Clock,
        details: "Forleng bookingen med 30 minutter",
        translationKey: "checkout:addons.extra_time"
    },
    {
        id: "equipment",
        name: "Utstyr",
        price: 150,
        description: "Ballnett, musikkanlegg",
        icon: Settings,
        details: "Inkluderer ballnett, musikkanlegg og annet utstyr",
        translationKey: "checkout:addons.equipment"
    },
    {
        id: "janitor",
        name: "Vaktmesterhjelp",
        price: 300,
        description: "Rigg/nedrigg",
        icon: Users,
        details: "Hjelp med oppsett og nedrigg av utstyr",
        translationKey: "checkout:addons.janitor"
    },
    {
        id: "security",
        name: "Sikkerhet",
        price: 500,
        description: "Vaktmester på stedet",
        icon: Shield,
        details: "Vaktmester til stede under hele arrangementet",
        translationKey: "checkout:addons.security"
    },
];

export const useCheckoutLogic = () => {
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
    const [consents, setConsents] = useState<{ terms: boolean; cancellation: boolean; privacy: boolean }>(() => {
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
    const [userInfo, setUserInfo] = useState<UserInfo>(() => {
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
        [formatTime, t]
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
    }, [discountCode, t]);

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
        setConsents((prev: { terms: boolean; cancellation: boolean; privacy: boolean }) => ({
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
     * Handle payment completion
     */
    const handleCompletePayment = useCallback(async (): Promise<void> => {
        console.log('=== PAYMENT ATTEMPT STARTED ===');

        // Auto-select payment method if none selected
        if (!selectedPaymentMethod) {
            console.log('No payment method selected, auto-selecting card');
            setSelectedPaymentMethod("card");
        }

        if (!validateForm()) {
            return;
        }

        if (!user) {
            saveCheckoutState();
            navigate('/login?type=user&returnUrl=/checkout', {
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Test Supabase connection first
            const { error: testError } = await supabase
                .from('facilities')
                .select('id')
                .limit(1);

            if (testError) {
                throw new Error(`Database connection failed: ${testError.message}`);
            }

            // Create actual bookings in the database
            const bookingPromises = items.map(async (item) => {
                // Validate that facilityId is a proper UUID
                if (!item.facilityId || typeof item.facilityId !== 'string' || item.facilityId.length !== 36) {
                    throw new Error(`Invalid facility ID: ${item.facilityId}. Expected a valid UUID.`);
                }

                // Fetch facility details to get the correct org_id
                let orgId = "00000000-0000-0000-0000-000000000000";
                try {
                    const facility = await facilitiesService.getById(item.facilityId);
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

                            const bookingData = {
                                user_id: user.id,
                                facility_id: item.facilityId,
                                starts_at: startDateTime.toISOString(),
                                ends_at: endDateTime.toISOString(),
                                total_cents: Math.round(item.pricing?.finalPrice / (item.timeSlots.length || 1) * 100),
                                status: "pending" as const,
                                notes: item.purpose || "Booking",
                                is_recurring: true,
                                group_id: null,
                                org_id: orgId,
                                currency: "NOK",
                                zone_id: item.zoneId && typeof item.zoneId === 'string' && item.zoneId.length === 36 ? item.zoneId : null,
                            };

                            return createBookingMutation.mutateAsync(bookingData);
                        })
                    );
                }

                // For single bookings, create one booking
                if (item.timeSlots && item.timeSlots.length > 0) {
                    const slot = item.timeSlots[0];

                    const d =
                        typeof slot.date === "string"
                            ? new Date(slot.date)
                            : (slot.date as Date);
                    const bookingDate = `${d.getFullYear()}-${String(
                        d.getMonth() + 1
                    ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

                    const totalDurationMinutes = item.timeSlots.reduce(
                        (total, s) => total + (s.duration ?? 60),
                        0
                    );

                    const [startTime] = slot.timeSlot.split("-");
                    const startDateTime = new Date(`${bookingDate}T${startTime.trim()}:00`);
                    const endDateTime = new Date(startDateTime.getTime() + (totalDurationMinutes * 60 * 1000));

                    const bookingData = {
                        user_id: user.id,
                        facility_id: item.facilityId,
                        starts_at: startDateTime.toISOString(),
                        ends_at: endDateTime.toISOString(),
                        total_cents: Math.round(item.pricing?.finalPrice * 100),
                        status: "pending" as const,
                        notes: item.purpose || "Booking",
                        is_recurring: false,
                        group_id: null,
                        org_id: orgId,
                        currency: "NOK",
                        zone_id: item.zoneId && typeof item.zoneId === 'string' && item.zoneId.length === 36 ? item.zoneId : null,
                    };

                    return createBookingMutation.mutateAsync(bookingData);
                }

                // Fallback for bookings without time slots
                let fallbackOrgId = "00000000-0000-0000-0000-000000000000";
                try {
                    const facility = await facilitiesService.getById(item.facilityId);
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

                const bookingData = {
                    user_id: user.id,
                    facility_id: item.facilityId,
                    starts_at: startDateTime.toISOString(),
                    ends_at: endDateTime.toISOString(),
                    total_cents: Math.round(item.pricing?.finalPrice * 100),
                    status: "pending" as const,
                    notes: item.purpose || "Booking",
                    is_recurring: false,
                    group_id: null,
                    org_id: fallbackOrgId,
                    currency: "NOK",
                    zone_id: item.zoneId && typeof item.zoneId === 'string' && item.zoneId.length === 36 ? item.zoneId : null,
                };

                return createBookingMutation.mutateAsync(bookingData);
            });

            await Promise.all(bookingPromises.flat());

            clearCheckoutState();
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
        createBookingMutation,
        location.pathname,
        saveCheckoutState,
        t
    ]);

    return {
        // State
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        isProcessing,
        editingInfo,
        setEditingInfo,
        discountCode,
        setDiscountCode,
        discountApplied,
        addons,
        consents,
        errors,
        expandedSections,
        editingBookingDetails,
        userInfo,
        setUserInfo,

        // Actions
        handleDiscountCode,
        toggleAddon,
        handleConsentChange,
        toggleSection,
        handleBookingDetailsEdit,
        handleBookingDetailsSave,
        handleCompletePayment,

        // Computed
        pricing,
        formatDate,
        calculateTimeRange,

        // Data
        items,
        t
    };
};
