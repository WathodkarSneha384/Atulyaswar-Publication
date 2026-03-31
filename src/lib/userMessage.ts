/**
 * Normalizes API `error` fields so we never pass non-strings into Error() or UI.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.length > 0) {
    if (error === "[object Event]" || error === "[object Object]") return fallback;
    return error;
  }
  return fallback;
}

/**
 * Safe message from catch (...) for user-visible alerts.
 */
export function caughtErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string" && err.length > 0) return err;
  if (err instanceof Error) {
    const m = err.message;
    if (m === "[object Event]" || m === "[object Object]") return fallback;
    return m;
  }
  return fallback;
}
