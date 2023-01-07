export class FileTypeNotSupportedError extends Error {
  constructor(message: string = 'File type not supported') {
    super(message);
    this.name = 'FileTypeNotSupportedError';
  }
}
