/**
 * Payment Business Logic Service
 *
 * Contains all business logic related to payment operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

export interface IPaymentMethod {
  readonly id: string;
  readonly type: 'card' | 'vipps' | 'invoice' | 'bank_transfer';
  readonly provider: string;
  readonly isDefault: boolean;
  readonly lastFour?: string;
  readonly expiryMonth?: number;
  readonly expiryYear?: number;
  readonly holderName?: string;
}

export interface IPaymentTransaction {
  readonly id: string;
  readonly bookingId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  readonly paymentMethodId: string;
  readonly createdAt: string;
  readonly completedAt?: string;
  readonly failedAt?: string;
  readonly refundedAt?: string;
  readonly refundAmount?: number;
  readonly metadata?: Record<string, unknown>;
}

export interface IPaymentDetails {
  readonly subtotal: number;
  readonly vatAmount: number;
  readonly discountAmount: number;
  readonly totalAmount: number;
  readonly currency: string;
  readonly processingFee?: number;
}

export interface IRefundCalculation {
  readonly refundableAmount: number;
  readonly processingFee: number;
  readonly finalRefund: number;
  readonly cancellationFee: number;
  readonly reason: string;
}

/**
 * Validate payment method
 */
export const validatePaymentMethod = (
  method: Partial<IPaymentMethod>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!method.type) {
    errors.push('Payment method type is required');
  }

  if (!method.provider) {
    errors.push('Payment provider is required');
  }

  // Validate card-specific fields
  if (method.type === 'card') {
    if (!method.lastFour || method.lastFour.length !== 4) {
      errors.push('Last four digits must be exactly 4 characters');
    }

    if (!method.expiryMonth || method.expiryMonth < 1 || method.expiryMonth > 12) {
      errors.push('Expiry month must be between 1 and 12');
    }

    if (!method.expiryYear) {
      errors.push('Expiry year is required');
    } else {
      const currentYear = new Date().getFullYear();
      if (method.expiryYear < currentYear) {
        errors.push('Card has expired');
      }
    }

    if (!method.holderName || method.holderName.trim().length < 2) {
      errors.push('Card holder name must be at least 2 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate payment total including fees
 */
export const calculatePaymentTotal = (
  subtotal: number,
  vatRate: number = 0.25,
  discountAmount: number = 0,
  processingFeeRate: number = 0.02
): IPaymentDetails => {
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const vatAmount = discountedSubtotal * vatRate;
  const totalBeforeFees = discountedSubtotal + vatAmount;
  const processingFee = totalBeforeFees * processingFeeRate;
  const totalAmount = totalBeforeFees + processingFee;

  return {
    subtotal: Math.round(discountedSubtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    currency: 'NOK',
    processingFee: Math.round(processingFee * 100) / 100,
  };
};

/**
 * Validate if a transaction can be refunded
 */
export const canRefund = (
  transaction: IPaymentTransaction,
  hoursBeforeBooking: number = 24
): { canRefund: boolean; reason?: string } => {
  // Business rule: Can only refund completed transactions
  if (transaction.status !== 'completed') {
    return {
      canRefund: false,
      reason: 'Only completed transactions can be refunded',
    };
  }

  // Business rule: Check if already fully refunded
  if (transaction.status === 'refunded') {
    return {
      canRefund: false,
      reason: 'Transaction has already been fully refunded',
    };
  }

  // Business rule: Check if there's any amount left to refund
  if (transaction.refundAmount && transaction.refundAmount >= transaction.amount) {
    return {
      canRefund: false,
      reason: 'Transaction has already been fully refunded',
    };
  }

  // Additional time-based check would go here
  // For now, we allow refunds
  return { canRefund: true };
};

/**
 * Calculate refund amount based on cancellation policy
 */
export const calculateRefundAmount = (
  transactionAmount: number,
  hoursBeforeBooking: number,
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' = 'moderate'
): IRefundCalculation => {
  let refundPercentage = 0;
  let cancellationFee = 0;
  let reason = '';

  // Calculate refund based on policy and timing
  switch (cancellationPolicy) {
    case 'flexible':
      if (hoursBeforeBooking >= 24) {
        refundPercentage = 100;
        reason = 'Full refund - cancelled more than 24 hours before';
      } else if (hoursBeforeBooking >= 12) {
        refundPercentage = 75;
        cancellationFee = transactionAmount * 0.25;
        reason = 'Partial refund - cancelled 12-24 hours before (25% fee)';
      } else {
        refundPercentage = 50;
        cancellationFee = transactionAmount * 0.50;
        reason = 'Partial refund - cancelled less than 12 hours before (50% fee)';
      }
      break;

    case 'moderate':
      if (hoursBeforeBooking >= 48) {
        refundPercentage = 100;
        reason = 'Full refund - cancelled more than 48 hours before';
      } else if (hoursBeforeBooking >= 24) {
        refundPercentage = 50;
        cancellationFee = transactionAmount * 0.50;
        reason = 'Partial refund - cancelled 24-48 hours before (50% fee)';
      } else {
        refundPercentage = 0;
        cancellationFee = transactionAmount;
        reason = 'No refund - cancelled less than 24 hours before';
      }
      break;

    case 'strict':
      if (hoursBeforeBooking >= 72) {
        refundPercentage = 100;
        reason = 'Full refund - cancelled more than 72 hours before';
      } else if (hoursBeforeBooking >= 48) {
        refundPercentage = 50;
        cancellationFee = transactionAmount * 0.50;
        reason = 'Partial refund - cancelled 48-72 hours before (50% fee)';
      } else {
        refundPercentage = 0;
        cancellationFee = transactionAmount;
        reason = 'No refund - cancelled less than 48 hours before';
      }
      break;
  }

  const refundableAmount = (transactionAmount * refundPercentage) / 100;
  const processingFee = Math.min(refundableAmount * 0.02, 50); // Max 50 NOK processing fee
  const finalRefund = refundableAmount - processingFee;

  return {
    refundableAmount: Math.round(refundableAmount * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    finalRefund: Math.round(finalRefund * 100) / 100,
    cancellationFee: Math.round(cancellationFee * 100) / 100,
    reason,
  };
};

/**
 * Validate transaction status
 */
export const validateTransactionStatus = (
  transaction: IPaymentTransaction
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for required fields based on status
  if (transaction.status === 'completed' && !transaction.completedAt) {
    errors.push('Completed transactions must have a completion timestamp');
  }

  if (transaction.status === 'failed' && !transaction.failedAt) {
    errors.push('Failed transactions must have a failure timestamp');
  }

  if (transaction.status === 'refunded' && !transaction.refundedAt) {
    errors.push('Refunded transactions must have a refund timestamp');
  }

  if ((transaction.status === 'refunded' || transaction.status === 'partially_refunded') && !transaction.refundAmount) {
    errors.push('Refunded transactions must have a refund amount');
  }

  // Validate refund amount doesn't exceed transaction amount
  if (transaction.refundAmount && transaction.refundAmount > transaction.amount) {
    errors.push('Refund amount cannot exceed transaction amount');
  }

  // Validate amount is positive
  if (transaction.amount <= 0) {
    errors.push('Transaction amount must be positive');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format payment for display
 */
export const formatPaymentForDisplay = (transaction: IPaymentTransaction) => {
  const statusColors = {
    pending: 'yellow',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    refunded: 'gray',
    partially_refunded: 'orange',
  };

  const statusLabels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded',
  };

  return {
    ...transaction,
    formattedAmount: `${transaction.amount.toLocaleString('no-NO', { minimumFractionDigits: 2 })} ${transaction.currency}`,
    formattedRefundAmount: transaction.refundAmount
      ? `${transaction.refundAmount.toLocaleString('no-NO', { minimumFractionDigits: 2 })} ${transaction.currency}`
      : undefined,
    formattedCreatedAt: new Date(transaction.createdAt).toLocaleString('no-NO'),
    formattedCompletedAt: transaction.completedAt
      ? new Date(transaction.completedAt).toLocaleString('no-NO')
      : undefined,
    formattedFailedAt: transaction.failedAt
      ? new Date(transaction.failedAt).toLocaleString('no-NO')
      : undefined,
    formattedRefundedAt: transaction.refundedAt
      ? new Date(transaction.refundedAt).toLocaleString('no-NO')
      : undefined,
    statusColor: statusColors[transaction.status],
    statusLabel: statusLabels[transaction.status],
    isSuccessful: transaction.status === 'completed',
    isPending: transaction.status === 'pending' || transaction.status === 'processing',
    isFailed: transaction.status === 'failed',
    isRefunded: transaction.status === 'refunded' || transaction.status === 'partially_refunded',
  };
};

/**
 * Check if payment method is expired
 */
export const isPaymentMethodExpired = (method: IPaymentMethod): boolean => {
  if (method.type !== 'card') return false;
  if (!method.expiryMonth || !method.expiryYear) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (method.expiryYear < currentYear) return true;
  if (method.expiryYear === currentYear && method.expiryMonth < currentMonth) return true;

  return false;
};

/**
 * Calculate payment statistics
 */
export const calculatePaymentStats = (
  transactions: readonly IPaymentTransaction[]
) => {
  const total = transactions.length;
  const completed = transactions.filter(t => t.status === 'completed').length;
  const failed = transactions.filter(t => t.status === 'failed').length;
  const refunded = transactions.filter(t => t.status === 'refunded' || t.status === 'partially_refunded').length;
  const pending = transactions.filter(t => t.status === 'pending' || t.status === 'processing').length;

  const totalAmount = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = transactions
    .filter(t => t.refundAmount)
    .reduce((sum, t) => sum + (t.refundAmount || 0), 0);

  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    failed,
    refunded,
    pending,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalRefunded: Math.round(totalRefunded * 100) / 100,
    netAmount: Math.round((totalAmount - totalRefunded) * 100) / 100,
    successRate,
    failureRate: total > 0 ? Math.round((failed / total) * 100) : 0,
    refundRate: total > 0 ? Math.round((refunded / total) * 100) : 0,
  };
};

/**
 * Get recommended payment method based on amount and user preference
 */
export const getRecommendedPaymentMethod = (
  methods: readonly IPaymentMethod[],
  amount: number
): IPaymentMethod | undefined => {
  // Filter out expired cards
  const validMethods = methods.filter(method => !isPaymentMethodExpired(method));

  if (validMethods.length === 0) return undefined;

  // Prefer default method if available
  const defaultMethod = validMethods.find(m => m.isDefault);
  if (defaultMethod) return defaultMethod;

  // For large amounts (>5000 NOK), prefer invoice or bank transfer
  if (amount > 5000) {
    const invoiceMethod = validMethods.find(m => m.type === 'invoice' || m.type === 'bank_transfer');
    if (invoiceMethod) return invoiceMethod;
  }

  // For smaller amounts, prefer Vipps or card
  const quickMethod = validMethods.find(m => m.type === 'vipps' || m.type === 'card');
  if (quickMethod) return quickMethod;

  // Return first available method
  return validMethods[0];
};
