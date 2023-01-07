export class WrongConfigError extends Error {
  public constructor(key: string, value: string) {
    super(`Config key "${key}" has wrong value "${value}".`);
  }
}
