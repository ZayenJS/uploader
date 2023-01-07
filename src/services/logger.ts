import { Console } from 'console';
import chalk from 'chalk';
import fsp from 'fs/promises';
import fs from 'fs';
import path from 'path';

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

  public print(...args: any[]) {
    let label = '';

    if (typeof args[0] !== 'string') {
      label = chalk.gray('LOG');
    } else {
      const customLabel = args[0];

      // if the label includes a color code, then it's a custom label
      if (Logger._labels.includes(customLabel)) {
        label = customLabel;
        args.shift();
      }
    }

    const message = `[${label}]` + JSON.stringify(args.join(' | '));
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1 < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
    const day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
    const date = `${year}-${month}-${day}`;
    const hours = today.getHours() < 10 ? `0${today.getHours()}` : today.getHours();
    const minutes = today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes();

    super.log(`[${label}]`, ...args);
    // remove color codes from the message
    fsp.appendFile(
      path.join(process.cwd(), 'logs', `${date}.log`),
      `[${hours}:${minutes}] ${message.replace(/\x1b\[\d+m/g, '')}\n`,
    );
  }

  public log(...args: any[]) {
    super.log(`[${chalk.gray('LOG')}]`, ...args);
  }

  public info(...args: any[]) {
    super.info(...args);
  }

  public warn(...args: any[]) {
    super.warn(...args);
  }

  public error(...args: any[]) {
    let label = '';

    if (typeof args[0] !== 'string') {
      label = chalk.red('ERROR');
    } else {
      const customLabel = args[0];

      // if the label includes a color code, then it's a custom label
      if (customLabel.includes('\x1b') && customLabel.includes('ERROR')) {
        label = customLabel;
        args.shift();
      }
    }

    super.error(`[${label}]`, ...args);
  }

  public debug(...args: any[]) {
    super.debug(...args);
  }

  public trace(...args: any[]) {
    super.trace(...args);
  }
}

export const logger = Logger.getInstance();
