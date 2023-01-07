export class UploadDirectoryNotSetError extends Error {
  constructor() {
    super('Upload directory is not set. Please set the UPLOAD_DIRECTORY environment variable.');
    this.name = 'UploadDirectoryNotSetError';
  }
}
