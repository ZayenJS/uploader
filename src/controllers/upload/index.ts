import chalk from 'chalk';
import config from '../../config';
import { logger, LoggerLabel } from '../../services/logger';
import { BaseController } from '../base';
import fsp from 'fs/promises';
import path from 'path';

export class UploadController extends BaseController {
  public static uploadOne = async () => {
    // if (!config.get<string>('uploadsDirectory')) {
    //   return ErrorController.internalServerError('Uploads directory not set');
    // }

    logger.print(chalk.cyanBright(LoggerLabel.UPLOAD_CONTROLLER), `Upload request received from ${this.getClientIp()}`);

    const file = this.getFiles(config.get('filesFieldName'));
    const folderName = this.getBody<string>('folder');
    const newFileName = this.getBody<string>('name');

    if (!file) {
      return this.json({ message: 'No files were uploaded' });
    }

    let newDestination = `${path.join(process.cwd(), 'uploads')}`;

    if (folderName) {
      newDestination = `${newDestination}/${folderName}`;
    }

    try {
      await fsp.access(newDestination);
    } catch (error) {
      await fsp.mkdir(newDestination, { recursive: true });
      logger.print(chalk.green(LoggerLabel.UPLOADER), `Upload storage created: ${newDestination}`);
    }

    const extension = file.originalname.split('.').pop();
    const newFilePath = `${newDestination}/${newFileName}.${extension}`;

    await fsp.rename(file.path, newFilePath);

    this.noContent();
  };
}
