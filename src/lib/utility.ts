/**
 * Utility Types
 */

// Make all properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

// Extract keys by value type
export type KeysByType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

// Deep partial
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

// Result type for async operations
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Pagination params
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Pagination result
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Base entity
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
