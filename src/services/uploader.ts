import chalk from 'chalk';
import { Request, Response } from 'express';
import fsp from 'fs/promises';
import { EnhancedRequest } from '../@types/interfaces/EnhancedRequest';
import config, { MulterConfig } from '../config';
import { logger, LoggerLabel } from './logger';
import multer from 'multer';
import { FileTypeNotSupportedError } from '../errors/FileTypeNotSupportedError';

export abstract class Uploader {
  protected static req: EnhancedRequest;
  protected static res: Response;

  public static async init(req: EnhancedRequest, res: Response) {
    this.req = req;
    this.res = res;

    const multerConfig = config.get<MulterConfig>('multer');

    try {
      await fsp.access(multerConfig.destination);
    } catch (error) {
      await fsp.mkdir(multerConfig.destination, { recursive: true });
      logger.print(chalk.green(LoggerLabel.UPLOADER), 'Upload storage created');
    }

    return this;
  }

  public static setup(fileFieldName: string = config.get('filesFieldName')) {
    const multerConfig = config.get<MulterConfig>('multer');

    return multer({
      dest: multerConfig.destination,
      limits: multerConfig.limits,
      fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (multerConfig.acceptedFileTypes.includes(file.mimetype)) {
          return cb(null, true);
        }

        cb(new FileTypeNotSupportedError());
      },
    }).array(fileFieldName, multerConfig.maxFiles);
  }
}
