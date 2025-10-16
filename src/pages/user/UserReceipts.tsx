"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Receipt, 
  Download, 
  Calendar, 
  MapPin, 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Filter,
  Search,
  Eye,
  Copy,
  Mail,
  ExternalLink,
  DollarSign,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Plus
} from "lucide-react";

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
}

const UserReceipts = (): JSX.Element => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [showReceiptDetails, setShowReceiptDetails] = useState<string | null>(null);

  // Enhanced mock data
  const receipts: readonly IReceipt[] = [
    {
      id: "1",
      facility: "Drammen Idrettshall",
      date: "2024-01-15",
      amount: 1500,
      status: "paid",
      paymentMethod: "Visa •••• 1234",
      bookingId: "BK-2024-001",
      location: "Drammen",
      duration: "3 timer",
      purpose: "Fotballtrening",
      invoiceNumber: "INV-2024-001",
      paidAt: "2024-01-10T14:30:00Z",
      category: "Idrett",
      mvaAmount: 375
    },
    {
      id: "2",
      facility: "Kulturhuset",
      date: "2024-01-20",
      amount: 3200,
      status: "paid",
      paymentMethod: "Mastercard •••• 5678",
      bookingId: "BK-2024-002",
      location: "Drammen sentrum",
      duration: "4 timer",
      purpose: "Konsert",
      invoiceNumber: "INV-2024-002",
      paidAt: "2024-01-18T16:45:00Z",
      category: "Kultur",
      mvaAmount: 800
    },
    {
      id: "3",
      facility: "Møterom 1",
      date: "2024-01-25",
      amount: 400,
      status: "cancelled",
      paymentMethod: "Visa •••• 1234",
      bookingId: "BK-2024-003",
      location: "Drammen sentrum",
      duration: "2 timer",
      purpose: "Team meeting",
      invoiceNumber: "INV-2024-003",
      cancelledAt: "2024-01-22T10:15:00Z",
      category: "Møterom",
      mvaAmount: 100,
      refundReason: "Avlyst av saksbehandler"
    },
    {
      id: "4",
      facility: "Solberghallen",
      date: "2024-02-01",
      amount: 800,
      status: "pending",
      paymentMethod: "Visa •••• 1234",
      bookingId: "BK-2024-004",
      location: "Drammen",
      duration: "2 timer",
      purpose: "Badminton",
      invoiceNumber: "INV-2024-004",
      category: "Idrett",
      mvaAmount: 200
    },
    {
      id: "5",
      facility: "Spiralen Fotballbane",
      date: "2024-01-12",
      amount: 650,
      status: "refunded",
      paymentMethod: "Visa •••• 1234",
      bookingId: "BK-2024-005",
      location: "Drammen",
      duration: "2 timer",
      purpose: "Fotballtrening",
      invoiceNumber: "INV-2024-005",
      refundedAt: "2024-01-15T09:30:00Z",
      category: "Idrett",
      mvaAmount: 162.5,
      refundReason: "Refundert 15.01.2024 – behandlet av Bookme"
    }
  ];

  const statusFilters = [
    { value: "all", label: "Alle", icon: Receipt, count: receipts.length },
    { value: "paid", label: "Betalt", icon: CheckCircle, count: receipts.filter(r => r.status === "paid").length },
    { value: "pending", label: "Venter på betaling", icon: Clock, count: receipts.filter(r => r.status === "pending").length },
    { value: "cancelled", label: "Betaling avbrutt", icon: XCircle, count: receipts.filter(r => r.status === "cancelled").length },
    { value: "refunded", label: "Beløp tilbakeført", icon: CheckCircle, count: receipts.filter(r => r.status === "refunded").length }
  ];

  const yearFilters = [
    { value: "all", label: "Alle år" },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" }
  ];

  const paymentMethodFilters = [
    { value: "all", label: "Alle metoder" },
    { value: "Visa", label: "Visa" },
    { value: "Mastercard", label: "Mastercard" },
    { value: "Faktura", label: "Faktura" }
  ];

  const sortOptions = [
    { value: "newest", label: "Nyeste først" },
    { value: "oldest", label: "Eldste først" },
    { value: "amount-high", label: "Beløp høy–lav" },
    { value: "amount-low", label: "Beløp lav–høy" }
  ];

  const filteredAndSortedReceipts = receipts
    .filter(receipt => {
      const statusMatch = filterStatus === "all" || receipt.status === filterStatus;
      const yearMatch = filterYear === "all" || receipt.date.startsWith(filterYear);
      const paymentMatch = filterPaymentMethod === "all" || receipt.paymentMethod.includes(filterPaymentMethod);
      const searchMatch = searchQuery === "" || 
        receipt.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      return statusMatch && yearMatch && paymentMatch && searchMatch;
    })
    .sort((a, b) => {
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

  const getStatusBadge = (status: IReceipt["status"]): JSX.Element => {
    const statusConfig = {
      paid: { 
        label: "Betalt", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle
      },
      pending: { 
        label: "Venter på betaling", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock
      },
      cancelled: { 
        label: "Betaling avbrutt", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle
      },
      refunded: { 
        label: "Beløp tilbakeført", 
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        icon: CheckCircle
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

  const getStatusBackgroundColor = (status: IReceipt["status"]): string => {
    switch (status) {
      case "paid":
        return "bg-green-50 dark:bg-green-900/10 border-l-4 border-l-green-500";
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-l-yellow-500";
      case "cancelled":
        return "bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500";
      case "refunded":
        return "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500";
      default:
        return "bg-gray-50 dark:bg-gray-800";
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK'
    }).format(amount);
  };

  const handleDownloadReceipt = (receiptId: string): void => {
    // Implement download receipt
    const receipt = receipts.find(r => r.id === receiptId);
    if (receipt) {
      // Create a simple PDF-like content for download
      const content = `
KVITTERING - ${receipt.facility}
Fakturanummer: ${receipt.invoiceNumber}
Booking-ID: ${receipt.bookingId}

Dato: ${formatDate(receipt.date)}
Lokasjon: ${receipt.location}
Formål: ${receipt.purpose}
Varighet: ${receipt.duration}

Beløp: ${formatAmount(receipt.amount)}
${receipt.mvaAmount ? `MVA (25%): ${formatAmount(receipt.mvaAmount)}` : ''}
Betalt med: ${receipt.paymentMethod}
Status: ${receipt.status === 'paid' ? 'Betalt' : receipt.status === 'pending' ? 'Venter på betaling' : receipt.status === 'cancelled' ? 'Avbrutt' : 'Refundert'}

${receipt.paidAt ? `Betalt: ${new Date(receipt.paidAt).toLocaleDateString('nb-NO')}` : ''}
${receipt.refundReason ? `Refunderingsinfo: ${receipt.refundReason}` : ''}

---
BookMe - Drammen kommune
      `.trim();
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kvittering-${receipt.invoiceNumber}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      
      // Show success message
      alert('Kvittering lastet ned!');
    }
  };

  const handleViewInvoice = (receiptId: string): void => {
    setShowReceiptDetails(showReceiptDetails === receiptId ? null : receiptId);
  };

  const handleCopyInvoiceNumber = (invoiceNumber: string): void => {
    navigator.clipboard.writeText(invoiceNumber);
    // Show toast notification
    alert('Fakturanummer kopiert til utklippstavle!');
  };

  const handleSendReceiptEmail = (receiptId: string): void => {
    // Implement send receipt email
    const receipt = receipts.find(r => r.id === receiptId);
    if (receipt) {
      // Create mailto link with receipt details
      const subject = `Kvittering for ${receipt.facility} - ${receipt.invoiceNumber}`;
      const body = `
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
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      // Show success message
      alert('E-post klargjort!');
    }
  };

  const handleCompletePayment = (receiptId: string): void => {
    // Navigate to payment portal
    const receipt = receipts.find(r => r.id === receiptId);
    if (receipt) {
      // In a real app, this would redirect to the payment provider
      alert(`Omdirigerer til betalingsportal for ${receipt.facility}...`);
      // Simulate navigation
      setTimeout(() => {
        window.location.href = `/payment/${receipt.bookingId}`;
      }, 1000);
    }
  };

  const handleExportCSV = (): void => {
    // Implement CSV export
    const csvHeaders = [
      'Fakturanummer',
      'Booking-ID', 
      'Fasilitet',
      'Dato',
      'Beløp',
      'Status',
      'Betaling',
      'Lokasjon',
      'Formål',
      'Varighet',
      'Kategori',
      'MVA',
      'Betalt dato'
    ];
    
    const csvData = filteredAndSortedReceipts.map(receipt => [
      receipt.invoiceNumber,
      receipt.bookingId,
      receipt.facility,
      receipt.date,
      receipt.amount,
      receipt.status,
      receipt.paymentMethod,
      receipt.location,
      receipt.purpose,
      receipt.duration,
      receipt.category || '',
      receipt.mvaAmount || 0,
      receipt.paidAt ? new Date(receipt.paidAt).toLocaleDateString('nb-NO') : ''
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kvitteringer-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Show success message
    alert('CSV-fil lastet ned!');
  };

  const totalAmount = filteredAndSortedReceipts
    .filter(r => r.status === "paid")
    .reduce((sum, receipt) => sum + receipt.amount, 0);

  const pendingAmount = filteredAndSortedReceipts
    .filter(r => r.status === "pending")
    .reduce((sum, receipt) => sum + receipt.amount, 0);

  const paidCount = filteredAndSortedReceipts.filter(r => r.status === "paid").length;

  // Calculate statistics
  const categoryStats = filteredAndSortedReceipts
    .filter(r => r.status === "paid")
    .reduce((acc, receipt) => {
      const category = receipt.category || "Annet";
      acc[category] = (acc[category] || 0) + receipt.amount;
      return acc;
    }, {} as Record<string, number>);

  const averageAmount = paidCount > 0 ? totalAmount / paidCount : 0;

  const renderReceiptDetails = (receipt: IReceipt): JSX.Element => (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Faktura detaljer</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fakturanummer:</span>
              <span className="text-gray-900 dark:text-white">{receipt.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Booking-ID:</span>
              <span className="text-gray-900 dark:text-white">{receipt.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Betalt med:</span>
              <span className="text-gray-900 dark:text-white">{receipt.paymentMethod}</span>
            </div>
            {receipt.mvaAmount && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">MVA (25%):</span>
                <span className="text-gray-900 dark:text-white">{formatAmount(receipt.mvaAmount)}</span>
              </div>
            )}
            {receipt.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Betalt:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(receipt.paidAt).toLocaleDateString('nb-NO')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Handlinger</h4>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadReceipt(receipt.id)}
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Last ned PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSendReceiptEmail(receipt.id)}
              className="w-full justify-start"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send på e-post
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopyInvoiceNumber(receipt.invoiceNumber)}
              className="w-full justify-start"
            >
              <Copy className="h-4 w-4 mr-2" />
              Kopier fakturanummer
            </Button>
          </div>
        </div>
      </div>
      
      {receipt.refundReason && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Refunderingsinfo:</h5>
          <p className="text-sm text-blue-700 dark:text-blue-400">{receipt.refundReason}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kvitteringer & betalinger
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Oversikt over alle dine betalinger og kvitteringer
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Alle priser vises i NOK og inkluderer MVA.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Eksporter CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatAmount(totalAmount)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Totalt betalt hittil
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Oppdatert per {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {paidCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Betalte bookinger
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Fullførte transaksjoner siste 6 måneder
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatAmount(pendingAmount)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sum ventende betalinger
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Avventer bekreftelse fra betalingsleverandør
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Field */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Søk i kvitteringer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status:
                </span>
                <div className="flex space-x-1">
                  {statusFilters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <Button
                        key={filter.value}
                        size="sm"
                        variant={filterStatus === filter.value ? "default" : "outline"}
                        onClick={() => setFilterStatus(filter.value)}
                        className="flex items-center gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {filter.label}
                        <Badge variant="secondary" className="ml-1">
                          {filter.count}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                År:
              </span>
              <div className="flex space-x-2">
                {yearFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    size="sm"
                    variant={filterYear === filter.value ? "default" : "outline"}
                    onClick={() => setFilterYear(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Betalingsmetode:
              </span>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                {paymentMethodFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sortering:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <div className="space-y-6">
        {filteredAndSortedReceipts.length > 0 ? (
          filteredAndSortedReceipts.map((receipt) => (
            <Card 
              key={receipt.id} 
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${getStatusBackgroundColor(receipt.status)}`}
              onClick={() => setExpandedReceipt(expandedReceipt === receipt.id ? null : receipt.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Status Icon */}
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex-1">
                      {/* Header: Title + Status */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {receipt.facility}
                        </h3>
                        {getStatusBadge(receipt.status)}
                      </div>
                      
                      {/* Body: Description, Date, Payment Method, Location */}
                      <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                        {receipt.purpose}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDate(receipt.date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Betalt med {receipt.paymentMethod}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {receipt.location}
                          </span>
                        </div>
                      </div>
                      
                      {/* Footer: Price + Invoice/Booking ID */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {formatAmount(receipt.amount)}
                        </span>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                          <span>Faktura: {receipt.invoiceNumber}</span>
                          <span>Booking: {receipt.bookingId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewInvoice(receipt.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {receipt.status === "paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReceipt(receipt.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {receipt.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompletePayment(receipt.id)}
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Betaling avventer godkjenning. Prøv på nytt hvis dette tar mer enn 24 timer."
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedReceipt(expandedReceipt === receipt.id ? null : receipt.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedReceipt === receipt.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedReceipt === receipt.id && renderReceiptDetails(receipt)}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ingen kvitteringer funnet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filterStatus === "all" 
                  ? "Du har ingen betalinger ennå. Start med å booke et lokale."
                  : `Du har ingen ${statusFilters.find(f => f.value === filterStatus)?.label.toLowerCase()} betalinger.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics Panel */}
      {Object.keys(categoryStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistikk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Totalt betalt per kategori</h4>
                <div className="space-y-2">
                  {Object.entries(categoryStats).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{category}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatAmount(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Gjennomsnitt</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gjennomsnittlig bookingkostnad:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatAmount(averageAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserReceipts;