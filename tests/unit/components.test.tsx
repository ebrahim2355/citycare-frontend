import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PasswordStrength } from "@/components/auth/password-strength";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { RatingStars } from "@/components/shared/rating-stars";
import { OverdueBadge, StatusBadge } from "@/components/shared/status-badge";
import { STATUS_META } from "@/lib/complaint-meta";
import { COMPLAINT_STATUSES } from "@/lib/filters";

describe("StatusBadge", () => {
  it.each(COMPLAINT_STATUSES)("shows a readable label for %s", (status) => {
    render(<StatusBadge status={status} />);

    expect(screen.getByText(STATUS_META[status].label)).toBeInTheDocument();
  });

  it("marks overdue work", () => {
    render(<OverdueBadge />);

    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });
});

describe("PaginationBar", () => {
  it("shows the range and moves between pages", async () => {
    const onPageChange = vi.fn();

    render(<PaginationBar meta={{ page: 1, limit: 10, total: 25, totalPages: 3 }} onPageChange={onPageChange} label="reports" />);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveTextContent("Showing 1 to 10 of 25 reports");
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));

    expect(onPageChange.mock.calls).toEqual([[2], [3]]);
  });

  it("shows nothing for an empty list and no buttons for a single page", () => {
    const { container, rerender } = render(
      <PaginationBar meta={{ page: 1, limit: 10, total: 0, totalPages: 0 }} onPageChange={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();

    rerender(<PaginationBar meta={{ page: 1, limit: 10, total: 4, totalPages: 1 }} onPageChange={vi.fn()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("PasswordStrength", () => {
  it.each([
    ["abc", "Too weak"],
    ["abcdefg1", "Good"],
    ["Abcdefg1", "Strong"],
    ["Abcdefg1!", "Very strong"],
  ])("rates %s as %s", (password, label) => {
    render(<PasswordStrength value={password} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("stays hidden until the user types", () => {
    const { container } = render(<PasswordStrength value="" />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("RatingStars", () => {
  it("describes the rating for screen readers", () => {
    render(<RatingStars value={4} />);

    expect(screen.getByRole("img", { name: "4 out of 5 stars" })).toBeInTheDocument();
  });
});
