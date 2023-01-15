import chalk from 'chalk';
import config from '../../config';
import { logger, LoggerLabel } from '../../services/logger';
import { BaseController } from '../base';
import fsp from 'fs/promises';
import path from 'path';

export class UploadController extends BaseController {
  public static get = async () => {
    logger.print(chalk.cyanBright(LoggerLabel.UPLOAD_CONTROLLER), `Upload request received from ${this.getClientIp()}`);
    const path = this.getParams<unknown>('path');

    logger.debug(JSON.stringify(path));

    return this.json({ message: 'Upload page' });
  };

  public static uploadOne = async () => {
    logger.print(chalk.cyanBright(LoggerLabel.UPLOAD_CONTROLLER), `Upload request received from ${this.getClientIp()}`);

    const file = this.getFiles(config.get('filesFieldName'));
    const folderName = this.getBody<string>('folder');
    const newFileName = this.getBody<string>('name');

    if (!file) {
      return this.json({ message: 'No files were sent to the server' }, 400);
    }

    const serverRoot = process.cwd();
    let newDestination = `${path.join(serverRoot, config.get<string>('uploadsDirectory'))}`;

    if (folderName) {
      newDestination = `${newDestination}/${folderName}`;
    }

    try {
      await fsp.access(newDestination);
    } catch (error) {
      await fsp.mkdir(newDestination, { recursive: true, mode: 0o777 });
      logger.print(chalk.green(LoggerLabel.UPLOADER), `Upload storage created: ${newDestination}`);
    }

    const extension = file.originalname.split('.').pop();
    const urlFriendlyFileName = (newFileName || file.originalname).replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    const newFilePath = `${newDestination}/${urlFriendlyFileName}.${extension}`;

    try {
      await fsp.rename(file.path, newFilePath);
    } catch (error) {
      return this.json({ message: 'File could not be uploaded' }, 500);
    }

    const ownBaseUrl = this.req.protocol + '://' + this.req.get('host');
    return this.json({ message: 'File uploaded successfully', path: newFilePath.replace(serverRoot, ownBaseUrl) }, 200);
  };
}
