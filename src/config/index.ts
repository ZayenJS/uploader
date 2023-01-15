import path from 'path';
import dotenv from 'dotenv';
import { NodeEnv } from '../@types/enums/NodeEnv';
import { UploadDirectoryNotSetError } from '../errors/UploadDirectoryNotSetError';
import { logger, LoggerLabel } from '../services/logger';
import chalk from 'chalk';

export interface ConfigEnv {
  cors: {
    origin: string;
    headers: string;
  };
  envFile: string;
  serverPort: number;
  filesFieldName: string;
  uploadsDirectory?: string;
  multer: {
    destination: string;
    limits: {
      fileSize: number;
    };
    acceptedFileTypes: string[];
  };
  logging: LoggingConfig;
}

export interface LoggingConfig {
  save: Partial<{
    custom: boolean;
    error: boolean;
    info: boolean;
    warn: boolean;
    debug: boolean;
    log: boolean;
    trace: boolean;
  }>;
}
export interface MulterConfig {
  destination: string;
  limits: {
    fileSize: number;
  };
  acceptedFileTypes: string[];
  maxFiles?: number;
}

interface ConfigProps {
  production: ConfigEnv;
  development: ConfigEnv;
}

export interface CorsConfig {
  origin: string;
  headers: string;
}

type GetConfigByKeyType = string | string[] | number | CorsConfig | MulterConfig | LoggingConfig;

class Config {
  private _config: ConfigProps;

  private static _instance: Config | null = null;

  private constructor() {
    if (process.env.NODE_ENV === NodeEnv.DEVELOPMENT) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const serverPort = +(process.env.SERVER_PORT || 8080);
    const multerConfig: MulterConfig = {
      destination: process.env.UPLOAD_TMP_DIRECTORY ?? path.join(process.cwd(), 'tmp'),
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB
      },
      acceptedFileTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'],
    };
    const filesFieldName = process.env.FILES_FIELD_NAME ?? 'files';

    const baseConfig = {
      cors: {
        origin: '*',
        headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      },
      filesFieldName,
      serverPort,
      multer: multerConfig,
      logging: {
        save: {
          custom: true,
          error: true,
          info: true,
          warn: true,
          debug: true,
          log: true,
          trace: true,
        },
      },
    };

    this._config = {
      production: {
        ...baseConfig,
        uploadsDirectory: process.env.UPLOAD_DIRECTORY,
        envFile: '.env.prod',
        logging: {
          ...baseConfig.logging,
          save: {
            ...baseConfig.logging.save,
            debug: false,
          },
        },
      },
      development: {
        ...baseConfig,
        uploadsDirectory: process.env.UPLOAD_DIRECTORY ?? 'uploads',
        envFile: '.env',
        logging: {
          ...baseConfig.logging,
        },
      },
    };
  }

  public load() {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = NodeEnv.DEVELOPMENT;
    }

    const config = this._config[(process.env.NODE_ENV as NodeEnv) || NodeEnv.DEVELOPMENT];
    dotenv.config({ path: path.join(process.cwd(), config.envFile) });

    try {
      this.throwErrorsIfAny();
    } catch (error) {
      logger.print(chalk.red(LoggerLabel.CONFIG), (error as Error).message);
      process.exit(1);
    }
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new Config();
    }

    return this._instance;
  }

  public get(): ConfigEnv;
  public get<T>(key: keyof ConfigEnv): T;

  public get<T>(key?: keyof ConfigEnv): T | GetConfigByKeyType | ConfigEnv | undefined {
    const config = this._config[(process.env.NODE_ENV as NodeEnv) || NodeEnv.DEVELOPMENT];

    if (key) {
      return config[key];
    }
    return config;
  }

  private throwErrorsIfAny() {
    logger.print(chalk.yellow(LoggerLabel.CONFIG), 'Checking for required config keys...');
    // implement this method to throw errors if any of the required config keys are not set using
    // throw new ConfigKeyNotSetError('KEY_NAME');

    if (!process.env.UPLOAD_DIRECTORY && process.env.NODE_ENV === NodeEnv.PRODUCTION) {
      throw new UploadDirectoryNotSetError();
    }

    logger.print(chalk.green(LoggerLabel.CONFIG), 'All required config keys are set');
  }
}

export default Config.getInstance();
