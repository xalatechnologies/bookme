import { useCallback } from "react";
import type { IReceipt } from "./useReceiptData";

interface UseReceiptActionsProps {
  readonly receipts: ReadonlyArray<IReceipt>;
}

interface UseReceiptActionsReturn {
  readonly handleDownloadReceipt: (receiptId: string) => void;
  readonly handleViewInvoice: (receiptId: string) => void;
  readonly handleCopyInvoiceNumber: (invoiceNumber: string) => void;
  readonly handleSendReceiptEmail: (receiptId: string) => void;
  readonly handleCompletePayment: (receiptId: string) => void;
  readonly handleExportCSV: (receipts: ReadonlyArray<IReceipt>) => void;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("nb-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(amount);
};

const createReceiptContent = (receipt: IReceipt): string => {
  const statusLabels = {
    paid: "Betalt",
    pending: "Venter på betaling",
    cancelled: "Avbrutt",
    refunded: "Refundert",
  };

  return `
KVITTERING - ${receipt.facility}
Fakturanummer: ${receipt.invoiceNumber}
Booking-ID: ${receipt.bookingId}

Dato: ${formatDate(receipt.date)}
Lokasjon: ${receipt.location}
Formål: ${receipt.purpose}
Varighet: ${receipt.duration}

Beløp: ${formatAmount(receipt.amount)}
${receipt.mvaAmount ? `MVA (25%): ${formatAmount(receipt.mvaAmount)}` : ""}
Betalt med: ${receipt.paymentMethod}
Status: ${statusLabels[receipt.status]}

${
  receipt.paidAt
    ? `Betalt: ${new Date(receipt.paidAt).toLocaleDateString("nb-NO")}`
    : ""
}
${receipt.refundReason ? `Refunderingsinfo: ${receipt.refundReason}` : ""}

---
BookMe - Drammen kommune
  `.trim();
};

const downloadTextFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const createEmailBody = (receipt: IReceipt): string => {
  return `
Hei,

Vedlagt finner du kvittering for din booking:

Fasilitet: ${receipt.facility}
Dato: ${formatDate(receipt.date)}
Beløp: ${formatAmount(receipt.amount)}
Fakturanummer: ${receipt.invoiceNumber}
Booking-ID: ${receipt.bookingId}

Med vennlig hilsen
BookMe - Drammen kommune
  `.trim();
};

const createCSVContent = (receipts: ReadonlyArray<IReceipt>): string => {
  const headers = [
    "Fakturanummer",
    "Booking-ID",
    "Fasilitet",
    "Dato",
    "Beløp",
    "Status",
    "Betaling",
    "Lokasjon",
    "Formål",
    "Varighet",
    "Kategori",
    "MVA",
    "Betalt dato",
  ];

  const data = receipts.map((receipt) => [
    receipt.invoiceNumber,
    receipt.bookingId,
    receipt.facility,
    receipt.date,
    receipt.amount.toString(),
    receipt.status,
    receipt.paymentMethod,
    receipt.location,
    receipt.purpose,
    receipt.duration,
    receipt.category || "",
    receipt.mvaAmount?.toString() || "0",
    receipt.paidAt ? new Date(receipt.paidAt).toLocaleDateString("nb-NO") : "",
  ]);

  return [headers, ...data]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");
};

export const useReceiptActions = ({
  receipts,
}: UseReceiptActionsProps): UseReceiptActionsReturn => {
  const handleDownloadReceipt = useCallback(
    (receiptId: string): void => {
      const receipt = receipts.find((r) => r.id === receiptId);
      if (!receipt) return;

      const content = createReceiptContent(receipt);
      downloadTextFile(content, `kvittering-${receipt.invoiceNumber}.txt`);

      // Show success message
      alert("Kvittering lastet ned!");
    },
    [receipts]
  );

  const handleViewInvoice = useCallback((receiptId: string): void => {
    // This is handled by state in the component
    // Kept here for consistency with the action interface
  }, []);

  const handleCopyInvoiceNumber = useCallback((invoiceNumber: string): void => {
    navigator.clipboard
      .writeText(invoiceNumber)
      .then(() => {
        alert("Fakturanummer kopiert til utklippstavle!");
      })
      .catch((error) => {
        console.error("Failed to copy invoice number:", error);
        alert("Kunne ikke kopiere fakturanummer");
      });
  }, []);

  const handleSendReceiptEmail = useCallback(
    (receiptId: string): void => {
      const receipt = receipts.find((r) => r.id === receiptId);
      if (!receipt) return;

      const subject = `Kvittering for ${receipt.facility} - ${receipt.invoiceNumber}`;
      const body = createEmailBody(receipt);

      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`;
      window.open(mailtoLink);

      // Show success message
      alert("E-post klargjort!");
    },
    [receipts]
  );

  const handleCompletePayment = useCallback(
    (receiptId: string): void => {
      const receipt = receipts.find((r) => r.id === receiptId);
      if (!receipt) return;

      // In a real app, this would redirect to the payment provider
      alert(`Omdirigerer til betalingsportal for ${receipt.facility}...`);

      // Simulate navigation
      setTimeout(() => {
        window.location.href = `/payment/${receipt.bookingId}`;
      }, 1000);
    },
    [receipts]
  );

  const handleExportCSV = useCallback((receipts: ReadonlyArray<IReceipt>): void => {
    const csvContent = createCSVContent(receipts);
    const filename = `kvitteringer-${new Date().toISOString().split("T")[0]}.csv`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    // Show success message
    alert("CSV-fil lastet ned!");
  }, []);

  return {
    handleDownloadReceipt,
    handleViewInvoice,
    handleCopyInvoiceNumber,
    handleSendReceiptEmail,
    handleCompletePayment,
    handleExportCSV,
  };
};

export { formatDate, formatAmount };
