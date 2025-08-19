class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConflictError);
    }
  }
}

export default ConflictError;
