/**
 * Payment Verification Abstraction Types
 * Provider-agnostic payment verification interfaces for UPI and digital transactions.
 */

export interface PaymentVerificationRequest {
  transactionId: string; // The claimed 12-digit UTR/Reference ID from the customer
  orderId: string; // Internal Order ID
  orderNumber: string; // Human readable order number e.g. ESH-1001
  expectedAmount: number; // Server-authoritative order amount in INR
  currency: string; // e.g. "INR"
  paymentReference: string; // Unique payment attempt reference
  merchantUpiId?: string; // Target merchant VPA (e.g. 9562445577@axisbank)
  createdAt?: Date; // Payment attempt creation time for window checks
}

export interface PaymentVerificationResult {
  verified: boolean;
  status: "SUCCESS" | "PENDING" | "FAILED" | "MANUAL_REVIEW";
  transactionId: string;
  amount?: number;
  currency?: string;
  receiverUpiId?: string;
  payerVpa?: string;
  verifiedAt?: Date;
  rawResponse?: Record<string, any>;
  message?: string;
  errorCode?: string;
}

export interface PaymentVerificationProvider {
  /** Provider identifier */
  readonly name: string;

  /** Checks whether the provider credentials/env are configured */
  isConfigured(): boolean;

  /**
   * Independent verification of a payment transaction against the authoritative network/provider.
   */
  verifyTransaction(request: PaymentVerificationRequest): Promise<PaymentVerificationResult>;
}
