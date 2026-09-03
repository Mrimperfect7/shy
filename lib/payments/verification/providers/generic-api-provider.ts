import { PaymentVerificationProvider, PaymentVerificationRequest, PaymentVerificationResult } from "../types";

/**
 * GenericApiVerificationProvider
 * Provider implementation for authorized verification services (e.g. UPI UTR Gateway, Verification API, or Decentro/Setu/Cashfree style aggregators).
 * 
 * Configured via:
 * - PAYMENT_PROVIDER_ENDPOINT
 * - PAYMENT_PROVIDER_API_KEY
 * - PAYMENT_PROVIDER_API_SECRET
 * - PAYMENT_PROVIDER_MERCHANT_VPA
 */
export class GenericApiVerificationProvider implements PaymentVerificationProvider {
  readonly name = "generic-api";

  private endpoint: string | undefined;
  private apiKey: string | undefined;
  private apiSecret: string | undefined;
  private expectedMerchantVpa: string | undefined;

  constructor() {
    this.endpoint = process.env.PAYMENT_PROVIDER_ENDPOINT;
    this.apiKey = process.env.PAYMENT_PROVIDER_API_KEY;
    this.apiSecret = process.env.PAYMENT_PROVIDER_API_SECRET;
    this.expectedMerchantVpa = process.env.PAYMENT_PROVIDER_MERCHANT_VPA || "9562445577@axisbank";
  }

  isConfigured(): boolean {
    return Boolean(this.endpoint && this.apiKey && this.apiSecret);
  }

  async verifyTransaction(request: PaymentVerificationRequest): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      return {
        verified: false,
        status: "MANUAL_REVIEW",
        transactionId: request.transactionId,
        message: "Verification provider credentials are missing.",
        errorCode: "PROVIDER_CONFIG_ERROR",
      };
    }

    try {
      const response = await fetch(`${this.endpoint}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey!,
          "X-Api-Secret": this.apiSecret!,
        },
        body: JSON.stringify({
          transactionId: request.transactionId,
          orderId: request.orderId,
          orderNumber: request.orderNumber,
          expectedAmount: request.expectedAmount,
          currency: request.currency,
          paymentReference: request.paymentReference,
        }),
        // 10s timeout
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        return {
          verified: false,
          status: "FAILED",
          transactionId: request.transactionId,
          message: `Verification service returned HTTP ${response.status}`,
          errorCode: `HTTP_${response.status}`,
          rawResponse: { errorBody },
        };
      }

      const data = await response.json();

      // Independent anti-fraud checks against the response:
      const verifiedStatus = data.status === "SUCCESS" || data.status === "COMPLETED";
      const verifiedAmount = typeof data.amount === "number" ? data.amount : parseFloat(data.amount || "0");
      const amountMatches = Math.abs(verifiedAmount - request.expectedAmount) < 0.01;
      const receiverMatches = !data.receiverVpa || data.receiverVpa.toLowerCase() === (this.expectedMerchantVpa || "").toLowerCase();

      if (verifiedStatus && amountMatches && receiverMatches) {
        return {
          verified: true,
          status: "SUCCESS",
          transactionId: data.transactionId || request.transactionId,
          amount: verifiedAmount,
          currency: data.currency || request.currency,
          receiverUpiId: data.receiverVpa,
          payerVpa: data.payerVpa,
          verifiedAt: new Date(data.timestamp || Date.now()),
          rawResponse: data,
        };
      }

      return {
        verified: false,
        status: data.status === "PENDING" ? "PENDING" : "FAILED",
        transactionId: request.transactionId,
        amount: verifiedAmount,
        currency: data.currency,
        message: !amountMatches 
          ? `Amount mismatch: expected ₹${request.expectedAmount}, received ₹${verifiedAmount}`
          : data.message || "Payment verification failed.",
        errorCode: !amountMatches ? "AMOUNT_MISMATCH" : data.errorCode || "VERIFICATION_FAILED",
        rawResponse: data,
      };
    } catch (err: any) {
      console.error("[GenericApiVerificationProvider] Error verifying transaction:", err);
      return {
        verified: false,
        status: "MANUAL_REVIEW",
        transactionId: request.transactionId,
        message: "Temporary error connecting to verification network. Flagged for review.",
        errorCode: err.name === "TimeoutError" ? "VERIFICATION_TIMEOUT" : "NETWORK_ERROR",
      };
    }
  }
}
