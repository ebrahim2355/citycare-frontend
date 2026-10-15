import type { ComplaintPaymentStatus, ComplaintStatus, PaymentStatus } from "./complaint";

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  provider: "STRIPE";
  status: PaymentStatus;
  transactionId: string;
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
