"use client";

// External libraries
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Minus,
  Lock,
  FileText,
  AlertCircle,
  Check,
  X,
  Info,
  ExternalLink,
  Star,
  Zap,
  Wifi,
  Camera,
  Users,
  Settings,
  ChevronRight,
  Loader2,
  Trash2
} from "lucide-react";

// Internal libraries/utilities
import { useCart } from "@/contexts/CartContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { GlobalHeader } from "@/components/GlobalHeader";

// UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Types
import type { ICartItem } from "@/types/cart";
import type { ISelectedTimeSlot } from "@/components/booking/types";

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
  const { items, totalPrice, clearCart, removeItem } = useCart();
  const { profile, updateProfile } = useUserProfile();
  
  // State management
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editingInfo, setEditingInfo] = useState<boolean>(false);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [consents, setConsents] = useState({
    terms: false,
    cancellation: false,
    privacy: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    userInfo: false,
    bookingDetails: false,
    addons: false,
    paymentMethods: false,
    consents: false
  });
  
  // Booking details editing state
  const [editingBookingDetails, setEditingBookingDetails] = useState<boolean>(false);

  // Editable user info
  const [userInfo, setUserInfo] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
    organizationName: "",
    organizationNumber: "",
    invoiceReference: "",
    projectCode: ""
  });

  // Add-ons with pricing and icons
  const availableAddons = [
    { 
      id: "extra-time", 
      name: "Ekstra tid", 
      price: 200, 
      description: "Per 30 min",
      icon: Clock,
      details: "Forleng bookingen med 30 minutter"
    },
    { 
      id: "equipment", 
      name: "Utstyr", 
      price: 150, 
      description: "Ballnett, musikkanlegg",
      icon: Settings,
      details: "Inkluderer ballnett, musikkanlegg og annet utstyr"
    },
    { 
      id: "janitor", 
      name: "Vaktmesterhjelp", 
      price: 300, 
      description: "Rigg/nedrigg",
      icon: Users,
      details: "Hjelp med oppsett og nedrigg av utstyr"
    },
    { 
      id: "security", 
      name: "Sikkerhet", 
      price: 500, 
      description: "Vaktmester på stedet",
      icon: Shield,
      details: "Vaktmester til stede under hele arrangementet"
    }
  ];

  /**
   * Calculate pricing with add-ons and discounts
   * Uses existing cart pricing (which already includes VAT) and adds add-ons
   */
  const pricing = useMemo(() => {
    // totalPrice from cart already includes VAT, so we need to extract it
    const totalWithVat = totalPrice;
    const vatAmount = Math.round(totalWithVat * 0.2); // 20% of total = 25% VAT
    const basePriceExcludingVat = totalWithVat - vatAmount;
    
    const addonPrice = Object.entries(addons).reduce((total, [id, selected]) => {
      if (selected) {
        const addon = availableAddons.find(a => a.id === id);
        return total + (addon?.price || 0);
      }
      return total;
    }, 0);
    
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
      total: finalTotal
    };
  }, [totalPrice, addons, discountApplied]);

  /**
   * Format date for display
   */
  const formatDate = useCallback((date: Date | string | number): string => {
    try {
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        return 'Ugyldig dato';
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Ugyldig dato';
      }
      
      return new Intl.DateTimeFormat("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(dateObj);
    } catch (error) {
      return 'Ugyldig dato';
    }
  }, []);

  /**
   * Format time for display
   */
  const formatTime = useCallback((timeSlot: string): string => {
    if (!timeSlot || typeof timeSlot !== 'string') {
      return 'Ugyldig tid';
    }
    return timeSlot.replace("-", " - ");
  }, []);

  /**
   * Calculate time range for multiple time slots
   * 
   * @param timeSlots - Array of time slots
   * @returns Formatted time range string
   */
  const calculateTimeRange = useCallback((timeSlots: readonly ISelectedTimeSlot[]): string => {
    if (!timeSlots || timeSlots.length === 0) {
      return 'Ingen tid';
    }

    if (timeSlots.length === 1) {
      return formatTime(timeSlots[0].timeSlot);
    }

    // For multiple slots, calculate the total time range
    // Sort slots by time to ensure correct order
    const sortedSlots = [...timeSlots].sort((a, b) => {
      const timeA = a.timeSlot.split('-')[0];
      const timeB = b.timeSlot.split('-')[0];
      return timeA.localeCompare(timeB);
    });

    const startTime = sortedSlots[0].timeSlot.split('-')[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    const endTime = lastSlot.timeSlot.split('-')[1];
    
    return `${startTime} - ${endTime}`;
  }, [formatTime]);

  /**
   * Handle discount code application
   */
  const handleDiscountCode = useCallback(() => {
    if (discountCode.toLowerCase() === 'welcome10') {
      setDiscountApplied(true);
      setErrors(prev => ({ ...prev, discount: '' }));
    } else {
      setErrors(prev => ({ ...prev, discount: 'Ugyldig rabattkode' }));
    }
  }, [discountCode]);

  /**
   * Handle addon toggle
   */
  const toggleAddon = useCallback((addonId: string) => {
    setAddons(prev => ({
      ...prev,
      [addonId]: !prev[addonId]
    }));
  }, []);

  /**
   * Handle consent change
   */
  const handleConsentChange = useCallback((consent: keyof typeof consents) => {
    setConsents(prev => ({
      ...prev,
      [consent]: !prev[consent]
    }));
  }, []);

  /**
   * Toggle section expansion
   */
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
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
      newErrors.payment = 'Velg en betalingsmetode';
    }
    
    // Make consent validation less strict for testing
    if (!consents.terms) {
      newErrors.consents = 'Du må godta vilkårene';
    }
    
    if (!consents.cancellation) {
      newErrors.consents = 'Du må lese avbestillingsreglene';
    }
    
    if (!consents.privacy) {
      newErrors.consents = 'Du må samtykke til personvern';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedPaymentMethod, consents]);

  /**
   * Generate next booking number (1-99999, then restart)
   */
  const getNextBookingNumber = useCallback((): number => {
    try {
      const lastNumber = parseInt(localStorage.getItem('lastBookingNumber') || '0');
      const nextNumber = lastNumber >= 99999 ? 1 : lastNumber + 1;
      localStorage.setItem('lastBookingNumber', nextNumber.toString());
      return nextNumber;
    } catch (error) {
      return 1;
    }
  }, []);

  /**
   * Handle payment completion
   */
  const handleCompletePayment = useCallback(async (): Promise<void> => {
    
    // Auto-select payment method if none selected
    if (!selectedPaymentMethod) {
      setSelectedPaymentMethod('card');
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      
      // Save cart items as pending bookings before clearing cart
      const pendingBookings = items.map(item => {
        // Recurring: one pending booking per occurrence from cart timeSlots
        if (item.bookingType === 'recurring' && item.timeSlots && item.timeSlots.length > 0) {
          return item.timeSlots.map(slot => {
            // normalize date to YYYY-MM-DD
            const d = typeof slot.date === 'string' ? new Date(slot.date) : (slot.date as Date);
            const bookingDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const hours = (slot.duration ?? 60) / 60;

            return {
              id: getNextBookingNumber().toString(),
              facility: item.facilityName,
              date: bookingDate,
              time: slot.timeSlot,
              duration: `${hours} timer`,
              status: 'pending' as const,
              location: 'Drammen',
              price: `${(item.pricing?.finalPrice / (item.timeSlots.length || 1)).toLocaleString('nb-NO')} kr`,
              description: item.purpose || 'Booking',
              purpose: item.purpose || 'Booking',
              participants: item.attendees || 1,
              zone: item.zoneName || 'Hovedbasseng',
              isRecurring: true,
              parentBookingId: (slot as any).parentBookingId ?? `${item.facilityId}-${item.zoneId}`,
              recurrencePattern: item.recurrencePattern,
              bookingType: 'recurring' as const,
              timeSlots: [slot]
            };
          });
        }
        // Handle date conversion more carefully to avoid timezone issues
        let bookingDate: string;
        if (item.timeSlots && item.timeSlots.length > 0) {
          const slotDate = item.timeSlots[0].date;
          if (slotDate instanceof Date) {
            // If it's already a Date object, use local date components to avoid timezone issues
            const year = slotDate.getFullYear();
            const month = String(slotDate.getMonth() + 1).padStart(2, '0');
            const day = String(slotDate.getDate()).padStart(2, '0');
            bookingDate = `${year}-${month}-${day}`;
          } else if (typeof slotDate === 'string') {
            // If it's a string, parse it and ensure we get the correct date
            const parsedDate = new Date(slotDate);
            // Use local date components to avoid timezone issues
            const year = parsedDate.getFullYear();
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const day = String(parsedDate.getDate()).padStart(2, '0');
            bookingDate = `${year}-${month}-${day}`;
          } else {
            // Fallback to today's date using local components
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            bookingDate = `${year}-${month}-${day}`;
          }
        } else {
          // Fallback to today's date using local components
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          bookingDate = `${year}-${month}-${day}`;
        }

        // Calculate proper time range from timeSlots
        let timeRange: string;
        if (item.timeSlots && item.timeSlots.length > 0) {
          if (item.timeSlots.length === 1) {
            timeRange = item.timeSlots[0].timeSlot;
          } else {
            // Sort slots by time to ensure correct order
            const sortedSlots = [...item.timeSlots].sort((a, b) => {
              const timeA = a.timeSlot.split('-')[0];
              const timeB = b.timeSlot.split('-')[0];
              return timeA.localeCompare(timeB);
            });
            const startTime = sortedSlots[0].timeSlot.split('-')[0];
            const lastSlot = sortedSlots[sortedSlots.length - 1];
            const endTime = lastSlot.timeSlot.split('-')[1];
            timeRange = `${startTime}-${endTime}`;
          }
        } else {
          timeRange = '12:00-13:00';
        }

        return {
          id: getNextBookingNumber().toString(),
          facility: item.facilityName,
          date: bookingDate,
          time: timeRange,
          duration: item.timeSlots && item.timeSlots.length > 0 
            ? `${item.timeSlots.reduce((total, slot) => total + (slot.duration ?? 60), 0) / 60} timer`
            : '1 timer',
          status: 'pending' as const,
          location: 'Drammen', // This could be dynamic based on facility
          price: `${item.pricing.finalPrice.toLocaleString('nb-NO')} kr`,
          description: item.purpose || 'Booking',
          purpose: item.purpose || 'Booking',
          contactPerson: 'Hamid Rahmani', // This should come from user profile
          paymentStatus: 'pending' as const,
          type: 'booking' as const,
          submittedAt: new Date().toISOString(),
          bookingType: item.bookingType,
          zoneName: item.zoneName,
          attendees: item.attendees,
          activityType: item.activityType,
          actorType: item.actorType,
          timeSlots: item.timeSlots // Store timeSlots for proper time calculation
        };
       }).flat();
      
      // Save to localStorage
      const existingPending = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const updatedPending = [...existingPending, ...pendingBookings];
      localStorage.setItem('pendingBookings', JSON.stringify(updatedPending));
      
      // Clear cart and redirect
      clearCart();
      navigate("/user/bookings?success=true");
    } catch (error) {
      setErrors({ payment: 'Betalingen feilet. Prøv igjen eller velg en annen metode.' });
      setIsProcessing(false);
    }
  }, [validateForm, clearCart, navigate, selectedPaymentMethod, items, getNextBookingNumber]);

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ingen bookinger å betale for
              </h2>
              <p className="text-gray-600 mb-6">
                Du har ingen aktive bookinger i handlekurven.
              </p>
              <Button onClick={() => navigate("/user/facilities")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake til lokaler
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
                  <span className="text-sm font-semibold text-green-600">Velg detaljer</span>
                  <p className="text-xs text-gray-500">Fullført</p>
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
                  <span className="text-sm font-semibold text-blue-600">Betaling</span>
                  <p className="text-xs text-gray-500">Aktivt trinn</p>
                </div>
              </div>
              <div className="w-20 h-1 bg-gray-200 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="ml-3">
                  <span className="text-sm font-semibold text-gray-400">Kvittering</span>
                  <p className="text-xs text-gray-400">Neste</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Security Notice */}
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center text-green-700">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">SSL-kryptert</span>
              </div>
              <div className="flex items-center text-green-700">
                <Lock className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Sikker betaling</span>
              </div>
              <div className="flex items-center text-green-700">
                <Star className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Stripe/PCI DSS</span>
              </div>
            </div>
            <p className="text-center text-xs text-green-600 mt-2">
              Kortdata lagres ikke hos BookMe. Alle betalinger er kryptert og sikre.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* User Information */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('userInfo')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChevronRight 
                      className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${
                        expandedSections.userInfo ? 'rotate-90' : ''
                      }`} 
                    />
                    <div>
                      <CardTitle className="text-lg">Dine opplysninger</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Kontrollér at opplysningene er riktige
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingInfo(!editingInfo);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {editingInfo ? 'Ferdig' : 'Endre'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedSections.userInfo && (
                <CardContent className="space-y-4">
                {editingInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Fornavn</Label>
                      <Input
                        id="firstName"
                        value={userInfo.firstName}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Etternavn</Label>
                      <Input
                        id="lastName"
                        value={userInfo.lastName}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-post</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={userInfo.address}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <User className="h-5 w-5 mr-3 text-gray-500" />
                      <span>{userInfo.firstName} {userInfo.lastName}</span>
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
                onClick={() => toggleSection('bookingDetails')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChevronRight 
                      className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${
                        expandedSections.bookingDetails ? 'rotate-90' : ''
                      }`} 
                    />
                    <div>
                      <CardTitle className="text-lg">Bookingdetaljer</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Kontrollér dato, tid og deltakere
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
                    {editingBookingDetails ? 'Avbryt' : 'Endre'}
                  </Button>
                </div>
              </CardHeader>
              {expandedSections.bookingDetails && (
                <CardContent className="space-y-4">
                {editingBookingDetails ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Rediger bookingdetaljer</h4>
                      <p className="text-sm text-blue-700 mb-4">
                        Du kan endre formål, antall deltakere og aktivitetstype for dine bookinger.
                      </p>
                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <div key={item.id} className="bg-white rounded-lg p-4 border border-blue-200">
                            <h5 className="font-medium text-gray-900 mb-3">{item.facilityName}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`purpose-${index}`}>Formål</Label>
                                <Input
                                  id={`purpose-${index}`}
                                  defaultValue={item.purpose || ''}
                                  placeholder="Beskriv formålet med bookingen"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`attendees-${index}`}>Antall deltakere</Label>
                                <Input
                                  id={`attendees-${index}`}
                                  type="number"
                                  min="1"
                                  defaultValue={item.attendees || 1}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`activity-${index}`}>Aktivitetstype</Label>
                                <Input
                                  id={`activity-${index}`}
                                  defaultValue={item.activityType || ''}
                                  placeholder="F.eks. fotball, møte, fest"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`additional-${index}`}>Tilleggsinformasjon</Label>
                                <Input
                                  id={`additional-${index}`}
                                  defaultValue={item.additionalInfo || ''}
                                  placeholder="Spesielle ønsker eller krav"
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
                          Avbryt
                        </Button>
                        <Button
                          onClick={handleBookingDetailsSave}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Lagre endringer
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {items.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{item.facilityName}</h3>
                            <p className="text-sm text-gray-600">{item.zoneName}</p>
                          </div>
                          <Badge variant="outline">
                            {item.bookingType === "recurring" ? "Gjentakende" : "Enkelt"}
                          </Badge>
                        </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {item.timeSlots && item.timeSlots.length > 0 
                            ? formatDate(item.timeSlots[0].date) 
                            : 'Ingen dato'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {item.timeSlots && item.timeSlots.length > 0 
                            ? calculateTimeRange(item.timeSlots) 
                            : 'Ingen tid'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {item.timeSlots && item.timeSlots.length > 0 
                            ? `${item.timeSlots.reduce((total, slot) => total + (slot.duration ?? 60), 0) / 60} timer`
                            : '0 timer'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{item.attendees || 0} deltakere</span>
                      </div>
                    </div>
                    
                    {item.purpose && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Formål:</p>
                        <p className="text-sm">{item.purpose}</p>
                      </div>
                    )}

                    {/* Show period for recurring bookings */}
                    {item.bookingType === "recurring" && item.timeSlots && item.timeSlots.length > 1 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Periode:</p>
                        <p className="text-sm">
                          {formatDate(item.timeSlots[0].date)} – {formatDate(item.timeSlots[item.timeSlots.length - 1].date)}
                        </p>
                      </div>
                    )}

                    {/* Usage Rules */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Regler for bruk</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Renhold etter bruk er påkrevd</li>
                        <li>• Nøkler hentes ved inngang 15 min før start</li>
                        <li>• Avbestilling gratis til 48 timer før start</li>
                        <li>• Gebyr ved no-show: 50% av leiepris</li>
                      </ul>
                    </div>
                  </div>
                ))}
                  </>
                )}
                </CardContent>
              )}
            </Card>

            {/* Enhanced Add-ons */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('addons')}
              >
                <div className="flex items-center">
                  <ChevronRight 
                    className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${
                      expandedSections.addons ? 'rotate-90' : ''
                    }`} 
                  />
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Plus className="h-5 w-5 mr-2 text-blue-600" />
                      Tillegg
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Legg til ekstra tjenester for din booking
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
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <IconComponent className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <Label htmlFor={addon.id} className="font-semibold cursor-pointer text-base">
                              {addon.name}
                            </Label>
                            <p className="text-sm text-gray-600">{addon.description}</p>
                            <div className="flex items-center mt-1">
                              <Info className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">{addon.details}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">{addon.price} kr</span>
                        {isSelected && (
                          <div className="flex items-center text-green-600 text-xs mt-1">
                            <Check className="h-3 w-3 mr-1" />
                            Valgt
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </CardContent>
              )}
            </Card>

            {/* Enhanced Payment Methods */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('paymentMethods')}
              >
                <div className="flex items-center">
                  <ChevronRight 
                    className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${
                      expandedSections.paymentMethods ? 'rotate-90' : ''
                    }`} 
                  />
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                      Betalingsmetode
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Velg hvordan du vil betale for bookingen
                    </p>
                  </div>
                </div>
              </CardHeader>
              {expandedSections.paymentMethods && (
                <CardContent className="space-y-4">
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  {/* Credit Card */}
                  <div className={`flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 ${
                    selectedPaymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <RadioGroupItem value="card" id="card" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="card" className="flex items-center cursor-pointer">
                        <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
                        <span className="font-semibold text-lg">Kredittkort</span>
                        <Badge variant="secondary" className="ml-2">Anbefalt</Badge>
                      </Label>
                      <p className="text-sm text-gray-600 mt-2">
                        Trekkes nå. Kvittering på e-post.
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">V</div>
                          <span className="text-xs text-gray-500">Visa</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs font-bold flex items-center justify-center">M</div>
                          <span className="text-xs text-gray-500">Mastercard</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs font-bold flex items-center justify-center">A</div>
                          <span className="text-xs text-gray-500">AmEx</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Payment */}
                  <div className={`flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 ${
                    selectedPaymentMethod === 'mobile' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <RadioGroupItem value="mobile" id="mobile" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="mobile" className="flex items-center cursor-pointer">
                        <Smartphone className="h-6 w-6 mr-3 text-green-600" />
                        <span className="font-semibold text-lg">Mobilbetaling</span>
                      </Label>
                      <p className="text-sm text-gray-600 mt-2">
                        Rask og sikker betaling med mobil
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-5 bg-purple-600 rounded text-white text-xs font-bold flex items-center justify-center">V</div>
                          <span className="text-xs text-gray-500">Vipps</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-5 bg-gray-900 rounded text-white text-xs font-bold flex items-center justify-center">A</div>
                          <span className="text-xs text-gray-500">Apple Pay</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs font-bold flex items-center justify-center">G</div>
                          <span className="text-xs text-gray-500">Google Pay</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice/EHF */}
                  <div className={`flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 ${
                    selectedPaymentMethod === 'invoice' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <RadioGroupItem value="invoice" id="invoice" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="invoice" className="flex items-center cursor-pointer">
                        <Building2 className="h-6 w-6 mr-3 text-orange-600" />
                        <span className="font-semibold text-lg">Faktura/EHF</span>
                        <Badge variant="outline" className="ml-2">Kun virksomheter</Badge>
                      </Label>
                      <p className="text-sm text-gray-600 mt-2">
                        25 dager betalingsfrist. Gebyr 50 kr.
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
                          <span>EHF støttet</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {/* EHF Fields */}
                {selectedPaymentMethod === "invoice" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-4">
                    <h4 className="font-medium text-blue-900">Fakturaopplysninger</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="orgName">Organisasjonsnavn</Label>
                        <Input
                          id="orgName"
                          value={userInfo.organizationName}
                          onChange={(e) => setUserInfo(prev => ({ ...prev, organizationName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="orgNumber">Organisasjonsnummer</Label>
                        <Input
                          id="orgNumber"
                          value={userInfo.organizationNumber}
                          onChange={(e) => setUserInfo(prev => ({ ...prev, organizationNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="invoiceRef">Referanse</Label>
                        <Input
                          id="invoiceRef"
                          value={userInfo.invoiceReference}
                          onChange={(e) => setUserInfo(prev => ({ ...prev, invoiceReference: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="projectCode">Prosjektkode</Label>
                        <Input
                          id="projectCode"
                          value={userInfo.projectCode}
                          onChange={(e) => setUserInfo(prev => ({ ...prev, projectCode: e.target.value }))}
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

            {/* Enhanced Consent and Terms */}
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('consents')}
              >
                <div className="flex items-center">
                  <ChevronRight 
                    className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${
                      expandedSections.consents ? 'rotate-90' : ''
                    }`} 
                  />
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Før du betaler
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Godta vilkårene for å fullføre bestillingen
                    </p>
                  </div>
                </div>
              </CardHeader>
              {expandedSections.consents && (
                <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      id="terms"
                      checked={consents.terms}
                      onCheckedChange={() => handleConsentChange('terms')}
                      className="h-5 w-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="terms" className="text-sm cursor-pointer flex items-start">
                        <span>Jeg godtar </span>
                        <a 
                          href="/terms" 
                          target="_blank" 
                          className="text-blue-600 hover:underline mx-1 flex items-center"
                        >
                          vilkår for leie
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
                      onCheckedChange={() => handleConsentChange('cancellation')}
                      className="h-5 w-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="cancellation" className="text-sm cursor-pointer flex items-start">
                        <span>Jeg har lest </span>
                        <a 
                          href="/cancellation" 
                          target="_blank" 
                          className="text-blue-600 hover:underline mx-1 flex items-center"
                        >
                          avbestillingsreglene
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
                      onCheckedChange={() => handleConsentChange('privacy')}
                      className="h-5 w-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="privacy" className="text-sm cursor-pointer">
                        Jeg samtykker til behandling av personopplysninger for denne bestillingen
                      </Label>
                    </div>
                    {consents.privacy && (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Ready to pay indicator */}
                {consents.terms && consents.cancellation && consents.privacy && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-semibold text-green-800">Klar til betaling!</p>
                        <p className="text-sm text-green-700">Alle samtykker er godtatt.</p>
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
                    Prisoversikt
                  </CardTitle>
                  <p className="text-blue-100 text-sm">
                    Du blir ikke belastet før bestillingen er bekreftet
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {/* Booking Type Breakdown */}
                  {items.map((item, index) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 font-medium">
                          {item.bookingType === "recurring" ? "Gjentakende" : "Enkelt"}
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
                          <span className="text-gray-600">Pris (ekskl. MVA)</span>
                          <span className="font-medium">
                            {(() => {
                              // Calculate price excluding VAT for this specific item
                              const itemPriceWithVat = item.pricing?.finalPrice || 0;
                              const itemVatAmount = Math.round(itemPriceWithVat * 0.2); // 20% of total = 25% VAT
                              const itemPriceExcludingVat = itemPriceWithVat - itemVatAmount;
                              return `${itemPriceExcludingVat.toLocaleString("nb-NO")} kr`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">MVA (25%)</span>
                          <span className="font-medium">
                            {(() => {
                              // Calculate VAT for this specific item
                              const itemPriceWithVat = item.pricing?.finalPrice || 0;
                              const itemVatAmount = Math.round(itemPriceWithVat * 0.2); // 20% of total = 25% VAT
                              return `${itemVatAmount.toLocaleString("nb-NO")} kr`;
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
                        <span className="text-gray-700 font-medium">Tillegg utstyr/tjenester</span>
                      </div>
                      
                      <div className="ml-4 space-y-1 text-sm">
                        {Object.entries(addons).map(([id, selected]) => {
                          if (!selected) return null;
                          const addon = availableAddons.find(a => a.id === id);
                          if (!addon) return null;
                          
                          return (
                            <div key={id} className="flex justify-between items-center">
                              <span className="text-gray-600">{addon.name}</span>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <div className="font-medium">{addon.price.toLocaleString("nb-NO")} kr (ekskl. MVA)</div>
                                  <div className="text-xs text-gray-500">+{(addon.price * 0.25).toLocaleString("nb-NO")} kr MVA</div>
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
                        placeholder="Rabattkode"
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
                        Bruk
                      </Button>
                    </div>
                    {discountApplied && (
                      <div className="flex items-center text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                        <Check className="h-4 w-4 mr-2" />
                        <span className="font-medium">Rabatt påført!</span>
                      </div>
                    )}
                    {errors.discount && (
                      <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{errors.discount}</div>
                    )}
                  </div>

                  {/* Discount */}
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3">
                      <span className="text-green-700 font-medium">Rabatt</span>
                      <span className="font-bold text-lg text-green-600">-{pricing.discountAmount.toLocaleString("nb-NO")} kr</span>
                    </div>
                  )}

                  {/* Invoice Fee */}
                  {selectedPaymentMethod === "invoice" && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">Fakturagebyr</span>
                      <span className="font-semibold">+50 kr</span>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Sum ekskl. MVA</span>
                    <span className="font-medium">{(pricing.basePriceExcludingVat + pricing.addonPrice).toLocaleString("nb-NO")} kr</span>
                  </div>

                  {/* VAT */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">MVA (25%)</span>
                    <span className="font-medium">{pricing.vatAmount.toLocaleString("nb-NO")} kr</span>
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 bg-blue-50 rounded-lg px-4">
                    <span className="text-xl font-bold text-gray-900">Totalt inkl. MVA</span>
                    <span className="text-2xl font-bold text-blue-600">{pricing.total.toLocaleString("nb-NO")} kr</span>
                  </div>

                  {/* Payment Due */}
                  <div className="text-center py-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      <Clock className="h-4 w-4 mr-1" />
                      {selectedPaymentMethod === "invoice" 
                        ? "Forfaller innen 25 dager"
                        : "Forfaller i dag"
                      }
                    </div>
                  </div>

                  {/* Enhanced Complete Payment Button */}
                  <Button
                    className="w-full h-14 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    disabled={isProcessing}
                    onClick={handleCompletePayment}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        Behandler betaling...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6 mr-3" />
                        {selectedPaymentMethod === "invoice" ? "Bestill med faktura" : "Fullfør og betal"}
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Enhanced Trust Signals */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        <span>SSL-kryptert</span>
                      </div>
                      <div className="flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        <span>Sikker betaling</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Ved å fullføre godtar du <a href="/terms" target="_blank" className="text-blue-600 hover:underline">vilkår</a> og <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">personvernerklæring</a>.
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
                <span className="font-bold text-lg">Prisoversikt</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{pricing.total.toLocaleString("nb-NO")} kr</div>
                <div className="text-xs text-gray-500">
                  {selectedPaymentMethod === "invoice" ? "Forfaller innen 25 dager" : "Forfaller i dag"}
                </div>
              </div>
            </div>
            
            <Button
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              disabled={isProcessing}
              onClick={handleCompletePayment}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Behandler betaling...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {selectedPaymentMethod === "invoice" ? "Bestill med faktura" : "Fullfør og betal"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile spacing to prevent content from being hidden behind fixed pricing */}
        <div className="lg:hidden h-24"></div>
      </div>
    </div>
  );
};

export default Checkout;
