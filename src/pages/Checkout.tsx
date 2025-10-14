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
  X
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
  const { items, totalPrice, clearCart } = useCart();
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

  // Add-ons with pricing
  const availableAddons = [
    { id: "extra-time", name: "Ekstra tid", price: 200, description: "Per 30 min" },
    { id: "equipment", name: "Utstyr", price: 150, description: "Ballnett, musikkanlegg" },
    { id: "janitor", name: "Vaktmesterhjelp", price: 300, description: "Rigg/nedrigg" },
    { id: "security", name: "Sikkerhet", price: 500, description: "Vaktmester på stedet" }
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
      console.error('Error formatting date:', error);
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
      console.error('Error generating booking number:', error);
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
            ? `${item.timeSlots.reduce((total, slot) => total + slot.duration, 0)} timer`
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
      });
      
      // Save to localStorage
      const existingPending = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const updatedPending = [...existingPending, ...pendingBookings];
      localStorage.setItem('pendingBookings', JSON.stringify(updatedPending));
      
      // Clear cart and redirect
      clearCart();
      navigate("/user/bookings?success=true");
    } catch (error) {
      console.error("Payment failed:", error);
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
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">Velg detaljer</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Betaling</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-400">Kvittering</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center">
            <Shield className="h-4 w-4 mr-2 text-green-600" />
            Betaling behandles sikkert. Kortdata lagres ikke hos BookMe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Dine opplysninger</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Kontrollér at opplysningene er riktige
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingInfo(!editingInfo)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {editingInfo ? 'Ferdig' : 'Endre'}
                  </Button>
                </div>
              </CardHeader>
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
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Bookingdetaljer</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Kontrollér dato, tid og deltakere
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Endre
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                            ? `${item.timeSlots.reduce((total, slot) => total + slot.duration, 0)} timer`
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
              </CardContent>
            </Card>

            {/* Add-ons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tillegg</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Legg til ekstra tjenester for din booking
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={addon.id}
                        checked={addons[addon.id] || false}
                        onCheckedChange={() => toggleAddon(addon.id)}
                      />
                      <div>
                        <Label htmlFor={addon.id} className="font-medium cursor-pointer">
                          {addon.name}
                        </Label>
                        <p className="text-sm text-gray-600">{addon.description}</p>
                      </div>
                    </div>
                    <span className="font-medium">{addon.price} kr</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Betalingsmetode</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Velg hvordan du vil betale for bookingen
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  {/* Credit Card */}
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex-1">
                      <Label htmlFor="card" className="flex items-center cursor-pointer">
                        <CreditCard className="h-5 w-5 mr-2" />
                        <span className="font-medium">Kredittkort</span>
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Trekkes nå. Kvittering på e-post.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Støttede kort: Visa, Mastercard, American Express
                      </p>
                    </div>
                  </div>

                  {/* Mobile Payment */}
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <div className="flex-1">
                      <Label htmlFor="mobile" className="flex items-center cursor-pointer">
                        <Smartphone className="h-5 w-5 mr-2" />
                        <span className="font-medium">Mobilbetaling</span>
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Vipps/Apple Pay/Google Pay. Trekkes nå.
                      </p>
                    </div>
                  </div>

                  {/* Invoice/EHF */}
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="invoice" id="invoice" />
                    <div className="flex-1">
                      <Label htmlFor="invoice" className="flex items-center cursor-pointer">
                        <Building2 className="h-5 w-5 mr-2" />
                        <span className="font-medium">Faktura/EHF</span>
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        25 dager betalingsfrist. Gebyr 50 kr. Kun virksomheter.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Fakturering via EHF støttes. ISO 27001. WCAG 2.2 AA.
                      </p>
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
            </Card>

            {/* Consent and Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Samtykker og regler</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Godta vilkårene for å fullføre bestillingen
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={consents.terms}
                      onCheckedChange={() => handleConsentChange('terms')}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      Jeg godtar <a href="/terms" target="_blank" className="text-blue-600 hover:underline">vilkår for leie</a>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="cancellation"
                      checked={consents.cancellation}
                      onCheckedChange={() => handleConsentChange('cancellation')}
                    />
                    <Label htmlFor="cancellation" className="text-sm cursor-pointer">
                      Jeg har lest <a href="/cancellation" target="_blank" className="text-blue-600 hover:underline">avbestillingsreglene</a>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={consents.privacy}
                      onCheckedChange={() => handleConsentChange('privacy')}
                    />
                    <Label htmlFor="privacy" className="text-sm cursor-pointer">
                      Jeg samtykker til behandling av personopplysninger for denne bestillingen
                    </Label>
                  </div>
                </div>

                {errors.consents && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.consents}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sticky Pricing Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prisoversikt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Base Price */}
                  <div className="flex justify-between text-sm">
                    <span>Leiepris</span>
                    <span>{pricing.basePriceWithVat.toLocaleString("nb-NO")} kr</span>
                  </div>

                  {/* Add-ons */}
                  {pricing.addonPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tillegg</span>
                      <span>{pricing.addonPriceWithVat.toLocaleString("nb-NO")} kr</span>
                    </div>
                  )}

                  {/* Discount Code */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Rabattkode"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDiscountCode}
                        disabled={!discountCode}
                      >
                        Bruk
                      </Button>
                    </div>
                    {discountApplied && (
                      <div className="flex items-center text-green-600 text-sm">
                        <Check className="h-4 w-4 mr-1" />
                        Rabatt påført
                      </div>
                    )}
                    {errors.discount && (
                      <div className="text-red-600 text-sm">{errors.discount}</div>
                    )}
                  </div>

                  {/* Discount */}
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Rabatt</span>
                      <span>-{pricing.discountAmount.toLocaleString("nb-NO")} kr</span>
                    </div>
                  )}

                  {/* Invoice Fee */}
                  {selectedPaymentMethod === "invoice" && (
                    <div className="flex justify-between text-sm">
                      <span>Fakturagebyr</span>
                      <span>50 kr</span>
                    </div>
                  )}

                  <Separator />

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span>Sum ekskl. MVA</span>
                    <span>{(pricing.basePriceExcludingVat + pricing.addonPrice).toLocaleString("nb-NO")} kr</span>
                  </div>

                  {/* VAT */}
                  <div className="flex justify-between text-sm">
                    <span>MVA (25%)</span>
                    <span>{pricing.vatAmount.toLocaleString("nb-NO")} kr</span>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Totalt inkl. MVA</span>
                    <span>{pricing.total.toLocaleString("nb-NO")} kr</span>
                  </div>

                  {/* Payment Due */}
                  <div className="text-sm text-gray-600 text-center">
                    {selectedPaymentMethod === "invoice" 
                      ? "Forfaller innen 25 dager"
                      : "Forfaller i dag"
                    }
                  </div>

                  {/* Complete Payment Button */}
                  <Button
                    className="w-full h-12 text-lg"
                    disabled={isProcessing}
                    onClick={handleCompletePayment}
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Behandler betaling...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {selectedPaymentMethod === "invoice" ? "Bestill med faktura" : "Fullfør og betal"}
                      </>
                    )}
                  </Button>

                  {/* Trust Signals */}
                  <div className="text-xs text-gray-500 text-center space-y-1">
                    <p>Ved å fullføre godtar du <a href="/terms" target="_blank" className="text-blue-600 hover:underline">vilkår</a> og <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">personvernerklæring</a>.</p>
                    <p>Alle betalinger er kryptert og sikre.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
