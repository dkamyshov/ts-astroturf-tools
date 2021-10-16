interface ErrorData {
  message?: string;
  stack?: string;
}

export const extractErrorData = (potentialError: unknown): ErrorData => {
  if (potentialError instanceof Error) {
    return potentialError;
  }

  return {};
};
