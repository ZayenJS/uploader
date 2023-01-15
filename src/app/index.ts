import chalk from 'chalk';
import express, { Express, Router } from 'express';
import path from 'path';
import config, { CorsConfig } from '../config';
import { ErrorController } from '../controllers';
import { LoggerLabel, logger } from '../services/logger';
import { Uploader } from '../services/uploader';

export class Application {
  private app: Express;

  constructor() {
    this.app = express();
  }

  public loadConfig() {
    config.load();

    return this;
  }

  public setCORSPolicy() {
    const cors = config.get<CorsConfig>('cors');

    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', cors.origin);
      res.header('Access-Control-Allow-Headers', cors.headers);
      next();
    });
    logger.print(chalk.green(LoggerLabel.CORS), `Allowed origins: ${cors.origin}`);

    return this;
  }

  public handleJSON() {
    this.app.use(express.json());
    logger.print(chalk.green(LoggerLabel.JSON_PARSER), 'OK');

    return this;
  }

  handleMultipartForms() {
    this.app.use((req, res, next) => {
      const multer = Uploader.setup(config.get('filesFieldName'));

      multer(req, res, (error) => {
        if (error) return ErrorController.init(req, res).badRequest(error.message);

        next();
      });
    });
    logger.print(chalk.green(LoggerLabel.MULTIPART_PARSER), 'OK');

    return this;
  }

  public handleURLEncodedForms() {
    this.app.use(express.urlencoded({ extended: true }));
    logger.print(chalk.green(LoggerLabel.URLENCODED_PARSER), 'OK');

    return this;
  }

  public handleStaticFiles() {
    try {
      this.app.use(express.static(path.join(process.cwd(), 'public')));
      this.app.use(
        '/' + config.get('uploadsDirectory'),
        express.static(path.join(process.cwd(), config.get('uploadsDirectory'))),
      );
      logger.print(chalk.green(LoggerLabel.STATIC_FILES), 'OK');

      return this;
    } catch (error) {
      logger.print(chalk.red(LoggerLabel.STATIC_FILES), (error as Error).message);
      this.shutdown(true);
      return this;
    }
  }

  public shutdown(withError = false) {
    if (withError) process.exit(1);
    process.exit(0);
  }

  public setRouter(router: Router) {
    this.app.use(router);
    logger.print(chalk.green(LoggerLabel.ROUTER), 'Set');

    return this;
  }

  public startServer(port?: number) {
    if (typeof port !== 'number') port = +config.get<number>('serverPort');

    this.app.listen(port, () => logger.print(chalk.green(LoggerLabel.SERVER), `Listenning on port ${port}`));

    return this;
  }
}
