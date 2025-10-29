import { useMemo } from "react";

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

interface Booking {
  readonly id: string;
  readonly facility?: string;
  readonly facilityName?: string;
  readonly zoneName?: string;
  readonly price?: string;
  readonly startDate?: string;
  readonly date?: string;
  readonly status: string;
  readonly duration?: string;
  readonly purpose?: string;
  readonly parentBookingId?: string;
  readonly time?: string;
  readonly startTime?: string;
  readonly bookingType?: string;
  readonly isRecurring?: boolean;
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
}

const parsePrice = (price?: string): number => {
  if (!price) return 0;
  return parseFloat(price.replace(/[^\d,]/g, "").replace(",", "."));
};

const getFacilityName = (booking: Booking): string => {
  return booking.facility || booking.facilityName || booking.zoneName || "Ukjent lokale";
};

const getCategory = (facilityName: string): string => {
  if (facilityName.includes("Idrett")) return "Idrett";
  if (facilityName.includes("Kultur")) return "Kultur";
  return "Generelt";
};

const mapStatus = (status: string): IReceipt["status"] => {
  if (status === "approved") return "paid";
  if (status === "rejected") return "cancelled";
  return "pending";
};

const groupRecurringBookings = (
  bookings: ReadonlyArray<Booking>
): { grouped: Map<string, Booking[]>; single: Booking[] } => {
  const grouped = new Map<string, Booking[]>();
  const single: Booking[] = [];

  bookings.forEach((booking) => {
    const parentKey =
      booking.parentBookingId ||
      `${booking.facility || booking.facilityName}-${booking.purpose}-${
        booking.time || booking.startTime
      }`;

    if (booking.isRecurring || booking.bookingType === "recurring") {
      if (!grouped.has(parentKey)) {
        grouped.set(parentKey, []);
      }
      grouped.get(parentKey)!.push(booking);
    } else {
      single.push(booking);
    }
  });

  return { grouped, single };
};

const createSingleReceipt = (booking: Booking, index: number): IReceipt => {
  const amount = parsePrice(booking.price);
  const mvaAmount = amount * 0.25; // 25% VAT
  const facilityName = getFacilityName(booking);
  const status = mapStatus(booking.status);

  return {
    id: booking.id,
    facility: facilityName,
    date: booking.startDate || new Date().toISOString().split("T")[0],
    amount,
    status,
    paymentMethod: "Visa •••• 1234",
    bookingId: booking.id,
    location: facilityName,
    duration: booking.duration || "1 time",
    purpose: booking.purpose || "Ikke spesifisert",
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}`,
    paidAt: status === "paid" ? new Date().toISOString() : undefined,
    cancelledAt: status === "cancelled" ? new Date().toISOString() : undefined,
    category: getCategory(facilityName),
    mvaAmount,
    refundReason: status === "cancelled" ? "Avvist av administrator" : undefined,
    isRecurring: false,
  };
};

const createRecurringReceipt = (
  parentKey: string,
  bookings: ReadonlyArray<Booking>,
  index: number
): IReceipt => {
  const first = bookings[0];
  const facilityName = getFacilityName(first);

  // Calculate total amount for all occurrences
  const totalAmount = bookings.reduce((sum, booking) => sum + parsePrice(booking.price), 0);
  const mvaAmount = totalAmount * 0.25; // 25% VAT

  // Determine group status
  const statuses = bookings.map((b) => b.status);
  const groupStatus: IReceipt["status"] = statuses.every((s) => s === "approved")
    ? "paid"
    : statuses.every((s) => s === "rejected")
    ? "cancelled"
    : "pending";

  return {
    id: parentKey,
    facility: facilityName,
    date: first.startDate || first.date || new Date().toISOString().split("T")[0],
    amount: totalAmount,
    status: groupStatus,
    paymentMethod: "Visa •••• 1234",
    bookingId: parentKey,
    location: facilityName,
    duration: `${bookings.length} occurrences`,
    purpose: first.purpose || "Ikke spesifisert",
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}`,
    paidAt: groupStatus === "paid" ? new Date().toISOString() : undefined,
    cancelledAt: groupStatus === "cancelled" ? new Date().toISOString() : undefined,
    category: getCategory(facilityName),
    mvaAmount,
    refundReason: groupStatus === "cancelled" ? "Avvist av administrator" : undefined,
    isRecurring: true,
    occurrenceCount: bookings.length,
    occurrences: bookings.map((booking) => ({
      id: booking.id,
      date: booking.startDate || booking.date || "",
      time: booking.startTime || booking.time || "",
      status: booking.status,
      amount: parsePrice(booking.price),
    })),
  };
};

const loadReceiptsFromStorage = (): ReadonlyArray<IReceipt> => {
  try {
    const pending = JSON.parse(localStorage.getItem("pendingBookings") || "[]");
    const processed = JSON.parse(localStorage.getItem("processedBookings") || "[]");
    const allBookings = [...pending, ...processed] as Booking[];

    const { grouped, single } = groupRecurringBookings(allBookings);

    // Convert single bookings to receipts
    const singleReceipts = single.map((booking, index) => createSingleReceipt(booking, index));

    // Convert recurring booking groups to receipts
    const recurringReceipts = Array.from(grouped.entries()).map(([parentKey, bookings], index) =>
      createRecurringReceipt(parentKey, bookings, index)
    );

    // Combine single and recurring receipts
    return [...singleReceipts, ...recurringReceipts];
  } catch (error) {
    console.error("Error loading receipts data:", error);
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
    averageAmount,
  };
};

const getStatusCounts = (receipts: ReadonlyArray<IReceipt>) => {
  return {
    all: receipts.length,
    paid: receipts.filter((r) => r.status === "paid").length,
    pending: receipts.filter((r) => r.status === "pending").length,
    cancelled: receipts.filter((r) => r.status === "cancelled").length,
    refunded: receipts.filter((r) => r.status === "refunded").length,
  };
};

export const useReceiptData = (filters: FilterOptions): UseReceiptDataReturn => {
  const receipts = useMemo(() => loadReceiptsFromStorage(), []);

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
  };
};

export type { IReceipt, FilterOptions, ReceiptStatistics };
