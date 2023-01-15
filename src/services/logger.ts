import { Console } from 'console';
import chalk from 'chalk';
import fsp from 'fs/promises';
import fs from 'fs';
import path from 'path';
import config, { LoggingConfig } from '../config';

export const LoggerLabel = {
  CONFIG: 'CONFIG',
  UPLOAD_CONTROLLER: 'UPLOAD_CONTROLLER',
  ERROR_CONTROLLER: 'ERROR_CONTROLLER',
  ERROR: 'ERROR',
  RESPONSE: 'RESPONSE',
  SERVER: 'SERVER',
  UPLOADER: 'UPLOADER',
  CORS: 'CORS',
  STATIC_FILES: 'STATIC_FILES',
  JSON_PARSER: 'JSON_PARSER',
  URLENCODED_PARSER: 'URLENCODED_PARSER',
  MULTIPART_PARSER: 'MULTIPART_PARSER',
  ROUTER: 'ROUTER',
};

export class Logger extends Console {
  private static _instance: Logger;

  private static _labels = [
    'CONFIG',
    'UPLOAD_CONTROLLER',
    'ERROR_CONTROLLER',
    'ERROR',
    'RESPONSE',
    'SERVER',
    'UPLOADER',
    'CORS',
    'STATIC_FILES',
    'JSON_PARSER',
    'URLENCODED_PARSER',
    'MULTIPART_PARSER',
    'ROUTER',
  ];

  private constructor() {
    super(process.stdout, process.stderr);

    try {
      fs.mkdirSync(path.join(process.cwd(), 'logs'));
    } catch (error) {
      // ignore
    }
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new Logger();
    }

    return this._instance;
  }

  private async _writeToDisk(message: string, directory: string = 'logs') {
    try {
      await fsp.access(path.join(process.cwd(), directory));
    } catch (error) {
      await fsp.mkdir(path.join(process.cwd(), directory));
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1 < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
    const day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
    const date = `${year}-${month}-${day}`;
    const hours = today.getHours() < 10 ? `0${today.getHours()}` : today.getHours();
    const minutes = today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes();
    // remove color codes from the message
    fsp.appendFile(
      path.join(process.cwd(), directory, `${date}.log`),
      `[${hours}:${minutes}] ${message.replace(/\x1b\[\d+m/g, '')}\n`,
    );
  }

  public print(...args: any[]) {
    let label = '';

    if (typeof args[0] !== 'string') {
      label = chalk.gray('LOG');
    } else {
      const customLabel = args[0];

      // check if the label is one of the predefined labels
      if (Logger._labels.includes(customLabel)) {
        label = customLabel;
        args.shift();
      }
    }

    const message = `[${label}]` + JSON.stringify(args.join(' | '));

    super.log(`[${label}]`, ...args);

    const loggingConfig = config.get<LoggingConfig>('logging');
    if (loggingConfig.save.custom) this._writeToDisk(message);
  }

  public log(...args: any[]) {
    super.log(`[${chalk.gray('LOG')}]`, ...args);

    const loggingConfig = config.get<LoggingConfig>('logging');

    if (loggingConfig.save.log) this._writeToDisk('[LOG]' + JSON.stringify(args.join(' | ')));
  }

  public info(...args: any[]) {
    super.info(...args);

    const loggingConfig = config.get<LoggingConfig>('logging');

    if (loggingConfig.save.log) this._writeToDisk('[INFO]' + JSON.stringify(args.join(' | ')));
  }

  public warn(...args: any[]) {
    super.warn(...args);

    const loggingConfig = config.get<LoggingConfig>('logging');

    if (loggingConfig.save.warn) this._writeToDisk(JSON.stringify(args.join(' | ')), 'logs/warnings');
  }

  public error(...args: any[]) {
    let label = '';

    if (typeof args[0] !== 'string') {
      label = chalk.red('ERROR');
    } else {
      const customLabel = args[0];

      // if the label includes ERROR, remove it from the args
      if (customLabel.includes('ERROR')) {
        label = customLabel;
        args.shift();
      }
    }

    super.error(`[${label}]`, ...args);

    const loggingConfig = config.get<LoggingConfig>('logging');

    if (loggingConfig.save.error) this._writeToDisk(JSON.stringify(args.join(' | ')), 'logs/errors');
  }

  public debug(...args: any[]) {
    super.debug(...args);

    const loggingConfig = config.get<LoggingConfig>('logging');

    if (loggingConfig.save.debug) this._writeToDisk(JSON.stringify(args.join(' | ')), 'logs/debug');
  }

  public trace(...args: any[]) {
    const loggingConfig = config.get<LoggingConfig>('logging');

    if (loggingConfig.save.trace) super.trace(...args);
  }
}

export const logger = Logger.getInstance();
