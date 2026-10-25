import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { complaintFilterSchema, countActiveFilters, parseFilters, userFilterSchema } from "@/lib/filters";
import { applyServerErrors } from "@/lib/forms";
import { categorySchema, complaintSchema, createUserSchema, emailSchema, registerSchema, trackSchema } from "@/lib/validations";

describe("parseFilters", () => {
  it("keeps valid filters from the URL and drops broken ones instead of failing", () => {
    const filters = parseFilters(
      complaintFilterSchema,
      new URLSearchParams("status=SUBMITTED&page=2&priority=NOW&searchTerm=%20%20&departmentId=not-a-uuid&overdue=true")
    );

    expect(filters).toEqual({ status: "SUBMITTED", page: 2, overdue: "true" });
  });

  it("reads the first value of repeated params from Next.js search params", () => {
    expect(parseFilters(userFilterSchema, { role: ["STAFF", "ADMIN"], sortOrder: "asc" })).toEqual({ role: "STAFF", sortOrder: "asc" });
  });

  it("counts only the filters a user chose", () => {
    expect(countActiveFilters({ page: 2, sortBy: "dueAt", status: "SUBMITTED", searchTerm: "", priority: undefined })).toBe(1);
  });
});

describe("form schemas", () => {
  it("trims emails before checking them", () => {
    expect(emailSchema.parse("  karim@example.com ")).toBe("karim@example.com");
  });

  it("asks for the same password twice", () => {
    const result = registerSchema.safeParse({
      name: "Karim Uddin",
      email: "karim@example.com",
      phone: "",
      password: "Citizen12345",
      confirmPassword: "Citizen1234",
    });

    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(["confirmPassword"]);
  });

  it("needs latitude and longitude together", () => {
    const result = complaintSchema.safeParse({
      categoryId: "c1",
      title: "Deep pothole",
      description: "A deep pothole near the gate.",
      priority: "HIGH",
      area: "Mirpur",
      address: "Road 7, Block C",
      latitude: 23.8,
    });

    expect(result.error?.issues[0]?.path).toEqual(["longitude"]);
  });

  it("keeps complaint categories free and staff tied to a department", () => {
    const category = categorySchema.safeParse({ name: "Pothole", type: "COMPLAINT", fee: 5, slaHours: 48, departmentId: "d1" });
    const staff = createUserSchema.safeParse({ name: "New Staff", email: "s@example.com", password: "Staff12345", role: "STAFF" });

    expect(category.error?.issues[0]?.path).toEqual(["fee"]);
    expect(staff.error?.issues[0]?.path).toEqual(["departmentId"]);
  });

  it("accepts tracking codes in any letter case", () => {
    expect(trackSchema.safeParse({ code: " cc-261017-ab12cd " }).success).toBe(true);
    expect(trackSchema.safeParse({ code: "CC-2610-AB12" }).success).toBe(false);
  });
});

describe("applyServerErrors", () => {
  it("puts API field errors on the matching inputs", () => {
    const setError = vi.fn();
    const error = new ApiError("Validation failed", 400, [
      { field: "email", message: "This email is already registered" },
      { field: "internal", message: "Not shown on the form" },
      { message: "General problem" },
    ]);

    expect(applyServerErrors(error, setError, ["email", "name"])).toBe(true);
    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith("email", { type: "server", message: "This email is already registered" });
  });

  it("ignores errors that did not come from the API", () => {
    const setError = vi.fn();

    expect(applyServerErrors(new Error("offline"), setError, ["email"])).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
