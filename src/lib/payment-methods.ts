import type { PaymentMethod, PaymentMethodOption } from "@/types";

interface PaymentMethodMeta {
  label: string;
  provider: string;
  hint: string;
  testHint: string;
  refundTo: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = ["CARD", "BKASH", "NAGAD"];

export const PAYMENT_METHOD_META: Record<PaymentMethod, PaymentMethodMeta> = {
  CARD: {
    label: "Card",
    provider: "Stripe",
    hint: "Visa, Mastercard or Amex",
    testHint: "Test mode: card 4242 4242 4242 4242, any future date, any CVC.",
    refundTo: "the card",
  },
  BKASH: {
    label: "bKash",
    provider: "SSLCommerz",
    hint: "Pay from your bKash account",
    testHint: "Sandbox: press Success on the SSLCommerz test page.",
    refundTo: "the bKash account",
  },
  NAGAD: {
    label: "Nagad",
    provider: "SSLCommerz",
    hint: "Pay from your Nagad account",
    testHint: "Sandbox: press Success on the SSLCommerz test page.",
    refundTo: "the Nagad account",
  },
};

export const STRIPE_SESSION_PATTERN = /^cs_(test|live)_[A-Za-z0-9]+$/;

export const SSL_TRANSACTION_PATTERN = /^CC[0-9A-F]{24}$/;

export const isMethodAvailable = (options: PaymentMethodOption[] | undefined, method: PaymentMethod) =>
  options?.find((option) => option.method === method)?.available ?? true;

export const firstAvailableMethod = (options: PaymentMethodOption[] | undefined, preferred: PaymentMethod) =>
  isMethodAvailable(options, preferred) ? preferred : (options?.find((option) => option.available)?.method ?? preferred);
