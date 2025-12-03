import { useMemo } from "react";
import { useUserBookings } from "@/services/supabase/bookings.service";
import { useAuth } from "@/contexts/hooks";
import type { BookingWithDetails } from "@/services/supabase/bookings.service";

interface IReceipt {
  readonly id: string;
  readonly facility: string;
  readonly date: string;
  readonly amount: number;
  readonly status: "paid" | "pending" | "cancelled" | "refunded";
  readonly paymentMethod: string;
  readonly bookingId: string;
  readonly location: string;
  readonly duration: string;
  readonly purpose: string;
  readonly invoiceNumber: string;
  readonly paidAt?: string;
  readonly cancelledAt?: string;
  readonly refundedAt?: string;
  readonly category?: string;
  readonly mvaAmount?: number;
  readonly refundReason?: string;
  readonly isRecurring?: boolean;
  readonly occurrenceCount?: number;
  readonly occurrences?: ReadonlyArray<{
    readonly id: string;
    readonly date: string;
    readonly time: string;
    readonly status: string;
    readonly amount: number;
  }>;
}

interface FilterOptions {
  readonly status: string;
  readonly year: string;
  readonly paymentMethod: string;
  readonly searchQuery: string;
  readonly sortBy: string;
}

interface ReceiptStatistics {
  readonly totalAmount: number;
  readonly pendingAmount: number;
  readonly paidCount: number;
  readonly categoryStats: Record<string, number>;
  readonly averageAmount: number;
}

interface UseReceiptDataReturn {
  readonly receipts: ReadonlyArray<IReceipt>;
  readonly filteredAndSortedReceipts: ReadonlyArray<IReceipt>;
  readonly statistics: ReceiptStatistics;
  readonly statusCounts: {
    readonly all: number;
    readonly paid: number;
    readonly pending: number;
    readonly cancelled: number;
    readonly refunded: number;
  };
  readonly isLoading: boolean;
}

const parsePrice = (price?: number | null): number => {
  if (!price) return 0;
  return price;
};

const getFacilityName = (booking: BookingWithDetails): string => {
  return booking.facility?.name || booking.zone?.name || "Ukjent lokale";
};

const getCategory = (facilityName: string): string => {
  if (facilityName.includes("Idrett")) return "Idrett";
  if (facilityName.includes("Kultur")) return "Kultur";
  return "Generelt";
};

const mapStatus = (status: string): IReceipt["status"] => {
  // Map Supabase booking statuses to receipt statuses
  switch (status) {
    case "paid":
    case "completed":
      return "paid";
    case "cancelled":
      return "cancelled";
    case "refunded":
      return "refunded";
    case "pending":
    case "awaiting_payment":
    default:
      return "pending";
  }
};

const groupRecurringBookings = (
  bookings: ReadonlyArray<BookingWithDetails>
): { grouped: Map<string, BookingWithDetails[]>; single: BookingWithDetails[] } => {
  const grouped = new Map<string, BookingWithDetails[]>();
  const single: BookingWithDetails[] = [];

  bookings.forEach((booking) => {
    // For recurring bookings, we need to group them
    // If they have a recurring_booking_id, use that as the key
    // Otherwise, create a synthetic key for recurring bookings without an explicit ID
    // Group by facility, purpose, day of week, and time pattern
    if (booking.is_recurring) {
      let key: string;
      if (booking.recurring_booking_id) {
        // Use the recurring booking ID as the grouping key
        key = booking.recurring_booking_id;
      } else {
        // Create a synthetic key for recurring bookings without an explicit ID
        // Group by facility, purpose, day of week, and time pattern
        const startDate = new Date(booking.starts_at);
        const endDate = new Date(booking.ends_at);
        const timePattern = `${startDate.getHours()}:${startDate.getMinutes()}-${endDate.getHours()}:${endDate.getMinutes()}`;
        const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Create a unique key based on the recurring pattern
        key = `recurring-${booking.facility_id}-${booking.notes || 'no-purpose'}-${dayOfWeek}-${timePattern}`;
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(booking);
    } else {
      // This is a single booking
      single.push(booking);
    }
  });

  return { grouped, single };
};

const createSingleReceipt = (booking: BookingWithDetails, index: number): IReceipt => {
  // Use total_cents and convert to NOK (cents to kroner)
  const amount = booking.total_cents ? booking.total_cents / 100 : 0;
  const mvaAmount = amount * 0.25; // 25% VAT
  const facilityName = getFacilityName(booking);
  const status = mapStatus(booking.status);

  // Calculate duration from starts_at and ends_at
  const duration = (() => {
    if (!booking.starts_at || !booking.ends_at) return "1 time";
    const start = new Date(booking.starts_at);
    const end = new Date(booking.ends_at);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return `${hours} time${hours !== 1 ? "r" : ""}`;
  })();

  return {
    id: booking.id,
    facility: facilityName,
    date: booking.starts_at ? new Date(booking.starts_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    amount,
    status,
    paymentMethod: "Visa •••• 1234",
    bookingId: booking.id,
    location: facilityName,
    duration,
    purpose: booking.notes || "Ikke spesifisert",
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}`,
    paidAt: status === "paid" && booking.updated_at ? booking.updated_at : undefined,
    cancelledAt: status === "cancelled" && booking.updated_at ? booking.updated_at : undefined,
    refundedAt: status === "refunded" && booking.updated_at ? booking.updated_at : undefined,
    category: getCategory(facilityName),
    mvaAmount,
    refundReason: status === "cancelled" ? "Avvist av administrator" : undefined,
    isRecurring: false};
};

const createRecurringReceipt = (
  parentKey: string,
  bookings: ReadonlyArray<BookingWithDetails>,
  index: number
): IReceipt => {
  const first = bookings[0];
  const facilityName = getFacilityName(first);

  // Calculate total amount for all occurrences (convert from cents to NOK)
  const totalAmount = bookings.reduce((sum, booking) => sum + (booking.total_cents ? booking.total_cents / 100 : 0), 0);
  const mvaAmount = totalAmount * 0.25; // 25% VAT

  // Determine group status
  const statuses = bookings.map((b) => b.status);
  const groupStatus: IReceipt["status"] = statuses.every((s) => s === "paid" || s === "completed")
    ? "paid"
    : statuses.every((s) => s === "cancelled")
    ? "cancelled"
    : statuses.some((s) => s === "refunded")
    ? "refunded"
    : "pending";

  return {
    id: parentKey,
    facility: facilityName,
    date: first.starts_at ? new Date(first.starts_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    amount: totalAmount,
    status: groupStatus,
    paymentMethod: "Visa •••• 1234",
    bookingId: parentKey,
    location: facilityName,
    duration: `${bookings.length} occurrences`,
    purpose: first.notes || "Ikke spesifisert",
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}`,
    paidAt: groupStatus === "paid" ? first.updated_at || new Date().toISOString() : undefined,
    cancelledAt: groupStatus === "cancelled" ? first.updated_at || new Date().toISOString() : undefined,
    refundedAt: groupStatus === "refunded" ? first.updated_at || new Date().toISOString() : undefined,
    category: getCategory(facilityName),
    mvaAmount,
    refundReason: groupStatus === "cancelled" ? "Avvist av administrator" : undefined,
    isRecurring: true,
    occurrenceCount: bookings.length,
    occurrences: bookings.map((booking) => ({
      id: booking.id,
      date: booking.starts_at ? new Date(booking.starts_at).toISOString().split("T")[0] : "",
      time: booking.starts_at ? new Date(booking.starts_at).toTimeString().slice(0, 5) : "",
      status: booking.status,
      amount: booking.total_cents ? booking.total_cents / 100 : 0, // Convert from cents to NOK
    }))};
};

const transformBookingsToReceipts = (
  bookings: ReadonlyArray<BookingWithDetails>
): ReadonlyArray<IReceipt> => {
  try {
    const { grouped, single } = groupRecurringBookings(bookings);

    // Convert single bookings to receipts
    const singleReceipts = single.map((booking, index) => createSingleReceipt(booking, index));

    // Convert recurring booking groups to receipts
    const recurringReceipts = Array.from(grouped.entries()).map(([parentKey, bookings], index) =>
      createRecurringReceipt(parentKey, bookings, index)
    );

    // Combine single and recurring receipts
    return [...singleReceipts, ...recurringReceipts];
  } catch (error) {
    console.error("Error transforming bookings to receipts:", error);
    return [];
  }
};

const filterReceipts = (
  receipts: ReadonlyArray<IReceipt>,
  filters: FilterOptions
): ReadonlyArray<IReceipt> => {
  return receipts.filter((receipt) => {
    const statusMatch = filters.status === "all" || receipt.status === filters.status;
    const yearMatch = filters.year === "all" || receipt.date.startsWith(filters.year);
    const paymentMatch =
      filters.paymentMethod === "all" || receipt.paymentMethod.includes(filters.paymentMethod);
    const searchMatch =
      filters.searchQuery === "" ||
      receipt.facility.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      receipt.purpose.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      receipt.invoiceNumber.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return statusMatch && yearMatch && paymentMatch && searchMatch;
  });
};

const sortReceipts = (
  receipts: ReadonlyArray<IReceipt>,
  sortBy: string
): ReadonlyArray<IReceipt> => {
  return [...receipts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "amount-high":
        return b.amount - a.amount;
      case "amount-low":
        return a.amount - b.amount;
      default:
        return 0;
    }
  });
};

const calculateStatistics = (
  receipts: ReadonlyArray<IReceipt>
): ReceiptStatistics => {
  const paidReceipts = receipts.filter((r) => r.status === "paid");
  const pendingReceipts = receipts.filter((r) => r.status === "pending");

  const totalAmount = paidReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const pendingAmount = pendingReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const paidCount = paidReceipts.length;

  const categoryStats = paidReceipts.reduce((acc, receipt) => {
    const category = receipt.category || "Annet";
    acc[category] = (acc[category] || 0) + receipt.amount;
    return acc;
  }, {} as Record<string, number>);

  const averageAmount = paidCount > 0 ? totalAmount / paidCount : 0;

  return {
    totalAmount,
    pendingAmount,
    paidCount,
    categoryStats,
    averageAmount};
};

const getStatusCounts = (receipts: ReadonlyArray<IReceipt>) => {
  return {
    all: receipts.length,
    paid: receipts.filter((r) => r.status === "paid").length,
    pending: receipts.filter((r) => r.status === "pending").length,
    cancelled: receipts.filter((r) => r.status === "cancelled").length,
    refunded: receipts.filter((r) => r.status === "refunded").length};
};

export const useReceiptData = (filters: FilterOptions): UseReceiptDataReturn => {
  const { user } = useAuth();
  const { data: bookings = [], isLoading } = useUserBookings(user?.id || "", !!user?.id);

  // Transform Supabase bookings to receipts
  const receipts = useMemo(() => transformBookingsToReceipts(bookings), [bookings]);

  const filteredAndSortedReceipts = useMemo(() => {
    const filtered = filterReceipts(receipts, filters);
    return sortReceipts(filtered, filters.sortBy);
  }, [receipts, filters]);

  const statistics = useMemo(
    () => calculateStatistics(filteredAndSortedReceipts),
    [filteredAndSortedReceipts]
  );

  const statusCounts = useMemo(() => getStatusCounts(receipts), [receipts]);

  return {
    receipts,
    filteredAndSortedReceipts,
    statistics,
    statusCounts,
    isLoading};
};

export type { IReceipt, FilterOptions, ReceiptStatistics };