"use client";

// External libraries
import React from "react";
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
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";

// Internal libraries/utilities
import { GlobalHeader } from "@/components/layouts/PublicLayout/GlobalHeader";
import { useCheckoutLogic, availableAddons } from "@/hooks/features/checkout/useCheckoutLogic";

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

  const {
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
  } = useCheckoutLogic();

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
                      className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${expandedSections.userInfo ? "rotate-90" : ""
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
                            setUserInfo((prev: typeof userInfo) => ({
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
                            setUserInfo((prev: typeof userInfo) => ({
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
                            setUserInfo((prev: typeof userInfo) => ({
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
                            setUserInfo((prev: typeof userInfo) => ({
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
                            setUserInfo((prev: typeof userInfo) => ({
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
                      className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${expandedSections.bookingDetails ? "rotate-90" : ""
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
                    className={`h-5 w-5 mr-3 text-gray-500 transition-transform duration-200 ${expandedSections.paymentMethods ? "rotate-90" : ""
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
                      className={`flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 ${selectedPaymentMethod === "card"
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
                      className={`flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 ${selectedPaymentMethod === "mobile"
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
                      className={`flex items-start space-x-4 p-5 border-2 rounded-xl transition-all duration-200 ${selectedPaymentMethod === "invoice"
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
                              GDPR
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                  {errors.payment && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.payment}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-lg border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {t("checkout:summary.title", "Din bestilling")}
                  </CardTitle>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {t("checkout:summary.subtotal", "Leiepris")} (
                        {t("checkout:summary.ex_vat", "eks. mva")})
                      </span>
                      <span>
                        {pricing.basePriceExcludingVat.toLocaleString()} kr
                      </span>
                    </div>

                    {/* Add-ons List */}
                    {Object.entries(addons).map(([id, selected]) => {
                      if (selected) {
                        const addon = availableAddons.find((a) => a.id === id);
                        return (
                          <div
                            key={id}
                            className="flex justify-between text-sm text-blue-600"
                          >
                            <span>
                              + {addon ? t(addon.translationKey + ".name", addon.name) : id}
                            </span>
                            <span>{addon?.price} kr</span>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {discountApplied && (
                      <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>
                          {t("checkout:summary.discount", "Rabatt (10%)")}
                        </span>
                        <span>-{pricing.discountAmount} kr</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{t("checkout:summary.vat", "MVA (25%)")}</span>
                      <span>{pricing.vatAmount.toLocaleString()} kr</span>
                    </div>

                    <div className="flex justify-between items-end pt-2">
                      <span className="font-bold text-lg text-gray-900">
                        {t("checkout:summary.total", "Totalt å betale")}
                      </span>
                      <div className="text-right">
                        <span className="block font-bold text-2xl text-blue-600">
                          {pricing.total.toLocaleString()} kr
                        </span>
                        <span className="text-xs text-gray-500">
                          {t("checkout:summary.inc_vat", "inkl. mva")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Discount Code */}
                  <div className="pt-4 border-t">
                    <Label
                      htmlFor="discount"
                      className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block"
                    >
                      {t("checkout:fields.discount_code", "Rabattkode")}
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="discount"
                        placeholder={t(
                          "checkout:placeholders.discount_code",
                          "Skriv inn kode"
                        )}
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDiscountCode}
                        disabled={!discountCode || discountApplied}
                      >
                        {t("common:actions.apply", "Bruk")}
                      </Button>
                    </div>
                    {discountApplied && (
                      <p className="text-green-600 text-xs mt-1 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t(
                          "checkout:messages.discount_applied",
                          "Rabattkode aktivert!"
                        )}
                      </p>
                    )}
                    {errors.discount && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.discount}
                      </p>
                    )}
                  </div>

                  {/* Add-ons Selection */}
                  <div className="pt-4 border-t">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">
                      {t("checkout:addons.title", "Anbefalte tillegg")}
                    </Label>
                    <div className="space-y-3">
                      {availableAddons.map((addon) => (
                        <div
                          key={addon.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${addons[addon.id]
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                            }`}
                          onClick={() => toggleAddon(addon.id)}
                        >
                          <Checkbox
                            id={addon.id}
                            checked={addons[addon.id] || false}
                            onCheckedChange={() => toggleAddon(addon.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <Label
                                htmlFor={addon.id}
                                className="font-medium cursor-pointer"
                              >
                                {t(addon.translationKey + ".name", addon.name)}
                              </Label>
                              <span className="text-sm font-semibold text-blue-600">
                                +{addon.price} kr
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {t(addon.translationKey + ".details", addon.details)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consents */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={consents.terms}
                        onCheckedChange={() => handleConsentChange("terms")}
                        className="mt-1"
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm text-gray-600 leading-tight cursor-pointer"
                      >
                        {t("checkout:consents.accept", "Jeg godtar")}{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          {t("checkout:consents.terms", "vilkårene")}
                        </a>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="cancellation"
                        checked={consents.cancellation}
                        onCheckedChange={() =>
                          handleConsentChange("cancellation")
                        }
                        className="mt-1"
                      />
                      <Label
                        htmlFor="cancellation"
                        className="text-sm text-gray-600 leading-tight cursor-pointer"
                      >
                        {t("checkout:consents.accept", "Jeg godtar")}{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          {t(
                            "checkout:consents.cancellation",
                            "avbestillingsreglene"
                          )}
                        </a>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="privacy"
                        checked={consents.privacy}
                        onCheckedChange={() => handleConsentChange("privacy")}
                        className="mt-1"
                      />
                      <Label
                        htmlFor="privacy"
                        className="text-sm text-gray-600 leading-tight cursor-pointer"
                      >
                        {t("checkout:consents.accept", "Jeg godtar")}{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          {t(
                            "checkout:consents.privacy",
                            "personvernerklæringen"
                          )}
                        </a>
                      </Label>
                    </div>
                    {errors.consents && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.consents}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <PrimaryButton
                    size="lg"
                    className="w-full text-lg h-14 shadow-lg shadow-blue-200"
                    onClick={handleCompletePayment}
                    isLoading={isProcessing}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("checkout:actions.processing", "Behandler...")}
                      </>
                    ) : (
                      <>
                        {t("checkout:actions.pay", "Betal")}{" "}
                        {pricing.total.toLocaleString()} kr
                      </>
                    )}
                  </PrimaryButton>

                  <div className="text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center">
                      <Shield className="h-3 w-3 mr-1" />
                      {t(
                        "checkout:messages.secure_payment",
                        "Sikker betaling via Nets/Vipps"
                      )}
                    </p>
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
