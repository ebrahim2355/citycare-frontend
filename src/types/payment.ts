import type { ComplaintPaymentStatus, ComplaintStatus, PaymentMethod, PaymentProvider, PaymentStatus } from "./complaint";

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  chargedAmount: string | null;
  chargedCurrency: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  complaint: {
    id: string;
    trackingCode: string;
    title: string;
    status: ComplaintStatus;
    paymentStatus: ComplaintPaymentStatus;
    category: { id: string; name: string };
  };
  citizen: { id: string; name: string; email: string };
}

export interface CheckoutResult {
  payment: Payment;
  checkoutUrl: string;
  reused: boolean;
}

export interface PaymentCheck {
  paid: boolean;
  payment: Payment;
}

export interface PaymentMethodOption {
  method: PaymentMethod;
  label: string;
  provider: PaymentProvider;
  available: boolean;
  testMode: boolean;
}

export interface PaymentMethods {
  currency: string;
  methods: PaymentMethodOption[];
}
