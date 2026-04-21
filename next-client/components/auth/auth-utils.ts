export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      data?: { message?: string; error?: string } | string;
      error?: string;
      message?: string;
    };

    if (typeof candidate.data === "string") {
      return candidate.data;
    }

    if (candidate.data && typeof candidate.data === "object") {
      if (typeof candidate.data.message === "string") {
        return candidate.data.message;
      }

      if (typeof candidate.data.error === "string") {
        return candidate.data.error;
      }
    }

    if (typeof candidate.error === "string") {
      return candidate.error;
    }

    if (typeof candidate.message === "string") {
      return candidate.message;
    }
  }

  return fallback;
}