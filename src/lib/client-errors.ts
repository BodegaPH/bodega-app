export function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const record = payload as Record<string, unknown>;
  const errorValue = record.error;

  if (typeof errorValue === "string") {
    return errorValue;
  }

  if (errorValue && typeof errorValue === "object") {
    const message = (errorValue as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}
