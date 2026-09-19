import { PaymentVerificationProvider } from "./types";
import { NullVerificationProvider } from "./providers/null-provider";
import { GenericApiVerificationProvider } from "./providers/generic-api-provider";

export * from "./types";

/**
 * Returns the configured PaymentVerificationProvider based on environment settings.
 * 
 * Configured via:
 * - PAYMENT_VERIFICATION_PROVIDER ("generic-api" | "webhook" | "null" / undefined)
 */
export function getPaymentVerificationProvider(): PaymentVerificationProvider {
  const providerType = (process.env.PAYMENT_VERIFICATION_PROVIDER || "").toLowerCase().trim();

  switch (providerType) {
    case "generic-api":
    case "api":
    case "webhook": {
      const provider = new GenericApiVerificationProvider();
      if (provider.isConfigured()) {
        return provider;
      }
      console.warn("[PaymentVerification] 'generic-api' provider requested but credentials are missing in env. Falling back to NullVerificationProvider.");
      return new NullVerificationProvider();
    }

    default:
      return new NullVerificationProvider();
  }
}
