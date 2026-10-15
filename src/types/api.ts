export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorItem {
  field?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta?: Meta;
  data: T;
  errors?: ApiErrorItem[];
}

export interface Paginated<T> {
  items: T[];
  meta: Meta;
}

export type QueryValue = string | number | boolean | undefined | null;

export type QueryParams = Record<string, QueryValue>;
