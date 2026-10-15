import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "@/lib/api/errors";

export const applyServerErrors = <T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, fields: readonly Path<T>[]) => {
  if (!isApiError(error)) {
    return false;
  }

  let applied = false;

  error.fieldErrors.forEach((item) => {
    const field = fields.find((name) => name === item.field);

    if (field) {
      setError(field, { type: "server", message: item.message });
      applied = true;
    }
  });

  return applied;
};
