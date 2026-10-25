import type { ApiErrorItem } from "@/types";

export class ApiError extends Error {
  status: number;
  errors: ApiErrorItem[];
  requestId?: string;

  constructor(message: string, status: number, errors: ApiErrorItem[] = [], requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.requestId = requestId;
  }

  get reference() {
    return this.status >= 500 && this.requestId ? this.requestId.slice(0, 8) : undefined;
  }

  get description() {
    const lines = this.errors.map((item) => item.message).filter((line) => line && line !== this.message);

    return [...new Set(lines)].join(". ") || undefined;
  }

  get fieldErrors() {
    return this.errors.filter((item): item is Required<ApiErrorItem> => Boolean(item.field));
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export const getErrorText = (error: unknown) => {
  if (isApiError(error)) {
    return { title: error.message, description: error.description, reference: error.reference };
  }

  return {
    title: "Something went wrong",
    description: error instanceof Error && error.message ? error.message : "Please try again in a moment.",
    reference: undefined,
  };
};
