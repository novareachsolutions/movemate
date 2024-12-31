export class MediaUploadError extends Error {
  constructor(message?: string) {
    super(message || "Failed to upload media");
    this.name = "MediaUploadError";
  }
}

export class MediaDeleteError extends Error {
  constructor(message?: string) {
    super(message || "Failed to delete media");
    this.name = "MediaDeleteError";
  }
}

export class MediaNotFoundError extends Error {
  constructor(message?: string) {
    super(message || "Media not found");
    this.name = "MediaNotFoundError";
  }
}

export class MediaInvalidKeyError extends Error {
  constructor(message?: string) {
    super(message || "Invalid media key");
    this.name = "MediaInvalidKeyError";
  }
}

export class MediaUnauthorizedError extends Error {
  constructor(message?: string) {
    super(message || "Unauthorized access to media");
    this.name = "MediaUnauthorizedError";
  }
}

export class MediaMissingFileError extends Error {
  constructor(message?: string) {
    super(message || "File is required");
    this.name = "MediaMissingFileError";
  }
}
