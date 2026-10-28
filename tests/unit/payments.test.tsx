import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaymentMethodLabel } from "@/components/payment/payment-method-mark";
import { PaymentMethodPicker } from "@/components/payment/payment-method-picker";
import { paymentFilterSchema, parseFilters } from "@/lib/filters";
import { firstAvailableMethod, SSL_TRANSACTION_PATTERN, STRIPE_SESSION_PATTERN } from "@/lib/payment-methods";
import { queryKeys } from "@/lib/query/options";
import type { PaymentMethodOption, PaymentMethods } from "@/types";

const option = (method: PaymentMethodOption["method"], available: boolean): PaymentMethodOption => ({
  method,
  label: method,
  provider: method === "CARD" ? "STRIPE" : "SSLCOMMERZ",
  available,
  testMode: true,
});

const renderPicker = (methods: PaymentMethods, value: PaymentMethodOption["method"] = "CARD") => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onChange = vi.fn();

  client.setQueryData(queryKeys.paymentMethods, methods);
  render(
    <QueryClientProvider client={client}>
      <PaymentMethodPicker value={value} onChange={onChange} />
    </QueryClientProvider>
  );

  return onChange;
};

describe("payment references", () => {
  it("tells a Stripe session from an SSLCommerz transaction", () => {
    expect(STRIPE_SESSION_PATTERN.test("cs_test_a1B2c3")).toBe(true);
    expect(SSL_TRANSACTION_PATTERN.test("CC0F3A9B27C4D15E8A6B90C2D4")).toBe(true);
    expect(SSL_TRANSACTION_PATTERN.test("cs_test_a1B2c3")).toBe(false);
    expect(SSL_TRANSACTION_PATTERN.test("CC0f3a9b27c4d15e8a6b90c2d4")).toBe(false);
  });

  it("keeps the method filter from the URL and drops an unknown one", () => {
    expect(parseFilters(paymentFilterSchema, new URLSearchParams("method=BKASH&status=COMPLETED"))).toEqual({
      method: "BKASH",
      status: "COMPLETED",
    });
    expect(parseFilters(paymentFilterSchema, new URLSearchParams("method=PAYPAL"))).toEqual({});
  });

  it("falls back to the first method the server offers", () => {
    const methods = [option("CARD", true), option("BKASH", false), option("NAGAD", true)];

    expect(firstAvailableMethod(methods, "BKASH")).toBe("CARD");
    expect(firstAvailableMethod(methods, "NAGAD")).toBe("NAGAD");
    expect(firstAvailableMethod(undefined, "BKASH")).toBe("BKASH");
  });
});

describe("PaymentMethodPicker", () => {
  it("offers card, bKash and Nagad and reports the choice", async () => {
    const onChange = renderPicker({ currency: "usd", methods: [option("CARD", true), option("BKASH", true), option("NAGAD", true)] });

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /^Card/ })).toBeChecked();

    await userEvent.click(screen.getByText("Pay from your bKash account"));

    expect(onChange).toHaveBeenCalledWith("BKASH");
  });

  it("disables a wallet the server cannot take and moves off it", async () => {
    const onChange = renderPicker(
      { currency: "usd", methods: [option("CARD", true), option("BKASH", false), option("NAGAD", false)] },
      "NAGAD"
    );

    expect(screen.getByRole("radio", { name: /^bKash/ })).toBeDisabled();
    expect(screen.getAllByText("Not available right now")).toHaveLength(2);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("CARD"));
  });
});

describe("PaymentMethodLabel", () => {
  it("names the method next to its mark", () => {
    render(<PaymentMethodLabel method="NAGAD" />);

    expect(screen.getByText("Nagad")).toBeInTheDocument();
  });
});
