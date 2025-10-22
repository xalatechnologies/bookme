"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  MessageSquare, 
  ChevronDown,
  Users,
  QrCode,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  MapPin
} from "lucide-react";

interface IUserBooking {
  readonly id: string;
  readonly facility: string;
  readonly date: string;
  readonly time: string;
  readonly duration: string;
  readonly status: "confirmed" | "pending" | "cancelled";
  readonly location: string;
  readonly price: string;
  readonly purpose: string;
  readonly participants?: readonly string[];
  readonly qrCode?: string;
  readonly cancellationPolicy?: string;
  readonly contactInfo?: {
    readonly phone: string;
    readonly email: string;
  };
  readonly isExpanded?: boolean;
}

interface IBookingListProps {
  readonly bookings: readonly IUserBooking[];
  readonly expandedBookings: Set<string>;
  readonly onToggleExpansion: (bookingId: string) => void;
  readonly onViewFacility: (facilityId: string) => void;
  readonly onEditBooking: (bookingId: string) => void;
  readonly onCancelBooking: (bookingId: string) => void;
  readonly onContactAdmin: (bookingId: string) => void;
}

const BookingList = (props: IBookingListProps): JSX.Element => {
  const { 
    bookings, 
    expandedBookings, 
    onToggleExpansion, 
    onViewFacility, 
    onEditBooking, 
    onCancelBooking, 
    onContactAdmin 
  } = props;

  const formatDate = (dateString: string): string => {
    // Handle date display more carefully to avoid timezone issues
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If it's a YYYY-MM-DD string, parse it as local date
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      return localDate.toLocaleDateString('nb-NO');
    } else {
      // Fallback to original method
      return new Date(dateString).toLocaleDateString('nb-NO');
    }
  };

  const getStatusBadge = (status: IUserBooking["status"]): JSX.Element => {
    const statusConfig = {
      confirmed: { 
        label: "Bekreftet", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-l-4 border-green-500",
        icon: CheckCircle
      },
      pending: { 
        label: "Ventende", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-l-4 border-yellow-500",
        icon: Clock
      },
      cancelled: { 
        label: "Avlyst", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-l-4 border-red-500",
        icon: XCircle
      }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Start din første booking
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Du har ingen bookinger ennå. Utforsk våre lokaler og book din første aktivitet.
        </p>
        <Button onClick={() => onViewFacility('new')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Book et lokale
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const isExpanded = expandedBookings.has(booking.id);
        return (
          <div
            key={booking.id}
            className={`border rounded-lg transition-all duration-200 hover:shadow-md ${
              booking.status === "confirmed" 
                ? "border-l-4 border-l-green-500 shadow-sm" 
                : booking.status === "pending"
                ? "border-l-4 border-l-yellow-500 shadow-sm"
                : "border-l-4 border-l-red-500 shadow-sm"
            }`}
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => onToggleExpansion(booking.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleExpansion(booking.id);
                }
              }}
              aria-expanded={isExpanded}
              aria-label={`Vis detaljer for booking ${booking.facility}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`font-medium ${
                      booking.status === "cancelled" 
                        ? "line-through text-gray-500 dark:text-gray-500" 
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {booking.facility}
                    </h4>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {formatDate(booking.date)} kl. {booking.time} • {booking.duration}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {booking.purpose} • {booking.price}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {booking.location}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewFacility(booking.id);
                  }}
                  aria-label={`Se detaljer for ${booking.facility}`}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Se detaljer
                </Button>
                
                {booking.status === "confirmed" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditBooking(booking.id);
                      }}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      aria-label={`Endre booking for ${booking.facility}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Endre
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelBooking(booking.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label={`Avlys booking for ${booking.facility}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Avlys
                    </Button>
                  </>
                )}
                
                {booking.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContactAdmin(booking.id);
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    aria-label={`Kontakt admin angående booking for ${booking.facility}`}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Kontakt
                  </Button>
                )}
                
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`} />
              </div>
            </div>
            
            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {booking.participants && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Deltakere
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {booking.participants.map((participant, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {participant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {booking.qrCode && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        QR-kode
                      </h5>
                      <div className="bg-white dark:bg-gray-700 p-2 rounded border text-center">
                        <div className="text-xs font-mono">{booking.qrCode}</div>
                      </div>
                    </div>
                  )}
                  
                  {booking.cancellationPolicy && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Avbestillingsregler
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.cancellationPolicy}
                      </p>
                    </div>
                  )}
                  
                  {booking.contactInfo && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Kontaktinfo
                      </h5>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-3 w-3" />
                          {booking.contactInfo.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-3 w-3" />
                          {booking.contactInfo.email}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};



export default BookingList;