import { PaymentVerificationProvider, PaymentVerificationRequest, PaymentVerificationResult } from "../types";

/**
 * NullVerificationProvider
 * Default provider when no automated third-party verification service is configured.
 * 
 * SECURITY GUARANTEE:
 * This provider NEVER marks a payment as verified/PAID.
 * It safely returns MANUAL_REVIEW status, storing the claimed UTR for admin inspection.
 */
export class NullVerificationProvider implements PaymentVerificationProvider {
  readonly name = "null-provider";

  isConfigured(): boolean {
    return false;
  }

  async verifyTransaction(request: PaymentVerificationRequest): Promise<PaymentVerificationResult> {
    return {
      verified: false,
      status: "MANUAL_REVIEW",
      transactionId: request.transactionId,
      amount: request.expectedAmount,
      currency: request.currency,
      message: "Automated payment verification provider is not configured. Your transaction ID has been safely recorded for merchant verification.",
      errorCode: "PROVIDER_UNCONFIGURED",
      rawResponse: {
        provider: this.name,
        timestamp: new Date().toISOString(),
        note: "Flagged for manual review."
      }
    };
  }
}
