import { ConfigEnv } from '../config';

export class ConfigKeyNotSetError extends Error {
  public constructor(key: keyof ConfigEnv) {
    super(`Config key "${key}" is not set.`);
  }
}
