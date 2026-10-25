import { describe, expect, it } from "vitest";
import { ApiError, getErrorText, isApiError } from "@/lib/api/errors";
import { buildQuery, readEnvelope, toPaginated } from "@/lib/api/http";
import { cloudinaryLoader } from "@/lib/image-loader";

describe("buildQuery", () => {
  it("skips empty values and encodes the rest", () => {
    expect(buildQuery({ page: 2, status: "", priority: undefined, staff: null, searchTerm: "dark road" })).toBe(
      "?page=2&searchTerm=dark+road"
    );
    expect(buildQuery()).toBe("");
  });
});

describe("readEnvelope", () => {
  it("returns a successful envelope", () => {
    expect(readEnvelope(200, { success: true, message: "ok", data: { id: 1 } })).toMatchObject({ data: { id: 1 } });
  });

  it("throws an ApiError with the status and the field errors", () => {
    try {
      readEnvelope(400, {
        success: false,
        message: "Validation failed",
        errors: [{ field: "email", message: "A valid email is required" }],
      });
      expect.unreachable();
    } catch (error) {
      expect(isApiError(error)).toBe(true);
      expect((error as ApiError).status).toBe(400);
      expect((error as ApiError).fieldErrors).toEqual([{ field: "email", message: "A valid email is required" }]);
    }
  });

  it("refuses a body that is not a CityCare envelope", () => {
    expect(() => readEnvelope(502, "<html>Bad gateway</html>")).toThrowError("Unexpected response from the server");
    expect(() => readEnvelope(200, { data: [] })).toThrowError(ApiError);
  });

  it("treats an error status as a failure even when the body says success", () => {
    expect(() => readEnvelope(500, { success: true, message: "odd", data: null })).toThrowError(ApiError);
  });
});

describe("ApiError", () => {
  it("builds one description from unique messages", () => {
    const error = new ApiError("Payment is not possible", 409, [
      { message: "Payment is not possible" },
      { message: "This request is CLOSED" },
      { message: "This request is CLOSED" },
    ]);

    expect(error.description).toBe("This request is CLOSED");
  });

  it("gives readable text for any error", () => {
    expect(getErrorText(new ApiError("Forbidden access", 403, [{ message: "Only admins" }]))).toEqual({
      title: "Forbidden access",
      description: "Only admins",
    });
    expect(getErrorText(new Error("Network down"))).toEqual({ title: "Something went wrong", description: "Network down" });
  });
});

describe("toPaginated", () => {
  it("falls back to a single page when the API sends no meta", () => {
    expect(toPaginated({ success: true, message: "ok", data: ["a", "b"] })).toEqual({
      items: ["a", "b"],
      meta: { page: 1, limit: 2, total: 2, totalPages: 1 },
    });
  });
});

describe("cloudinaryLoader", () => {
  it("asks Cloudinary for a resized, auto format image", () => {
    expect(
      cloudinaryLoader({ src: "https://res.cloudinary.com/demo/image/upload/v1/citycare/a.png", width: 640, quality: 75 })
    ).toBe("https://res.cloudinary.com/demo/image/upload/f_auto,q_75,c_limit,w_640/v1/citycare/a.png");
  });

  it("only adds a width to other images", () => {
    expect(cloudinaryLoader({ src: "https://lh3.googleusercontent.com/a/photo", width: 96 })).toBe(
      "https://lh3.googleusercontent.com/a/photo?w=96"
    );
    expect(cloudinaryLoader({ src: "https://example.com/p.png?v=2", width: 96 })).toBe("https://example.com/p.png?v=2&w=96");
  });
});
