/**
 * Extracts the API's specific error message from an axios error's
 * response body ({ message: "..." }), falling back to the error's own
 * message, then to a caller-supplied fallback.
 *
 * Duck-typed on axios's `isAxiosError` marker flag so it is trivially
 * testable without constructing real AxiosError instances.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "isAxiosError" in error) {
    const response = (
      error as { response?: { data?: { message?: unknown } } }
    ).response;
    const message = response?.data?.message;
    if (typeof message === "string" && message !== "") return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
