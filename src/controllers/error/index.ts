import chalk from 'chalk';
import { Response } from 'express';
import { EnhancedRequest } from '../../@types/interfaces/EnhancedRequest';
import { logger, LoggerLabel } from '../../services/logger';
import { BaseController } from '../base';

export class ErrorController extends BaseController {
  public static init = (req: EnhancedRequest, res: Response) => {
    super.init(req, res);

    return this;
  };

  private static traceIfDebug = (message?: string) => {
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG && message) {
      logger.trace(message);
    }
  };

  public static badRequest = (message?: string) => {
    this.json(
      {
        message: message ?? 'Bad request',
      },
      400,
    );
    logger.error(chalk.red(LoggerLabel.ERROR_CONTROLLER), chalk.red('Bad request: ' + message ?? 'Bad request'));
    this.traceIfDebug(message);
  };

  public static unauthorized = (message?: string) => {
    this.json(
      {
        message: message ?? 'Unauthorized',
      },
      401,
    );
    logger.error(chalk.red(LoggerLabel.ERROR_CONTROLLER), chalk.red('Unauthorized: ' + message ?? 'Unauthorized'));
    this.traceIfDebug(message);
  };

  public static forbidden = (message?: string) => {
    this.json(
      {
        message: message ?? 'Forbidden',
      },
      403,
    );
    logger.error(chalk.red(LoggerLabel.ERROR_CONTROLLER), chalk.red('Forbidden: ' + message ?? 'Forbidden'));
    this.traceIfDebug(message);
  };

  public static notFound = (message?: string) => {
    this.json(
      {
        message: message ?? 'Not found',
      },
      404,
    );
    logger.error(chalk.red(LoggerLabel.ERROR_CONTROLLER), chalk.red('Not found: ' + message ?? 'Not found'));
    this.traceIfDebug(message);
  };

  public static conflict = (message?: string) => {
    this.json(
      {
        message: message ?? 'Conflict',
      },
      409,
    );
    logger.error(chalk.red(LoggerLabel.ERROR_CONTROLLER), chalk.red('Conflict: ' + message ?? 'Conflict'));
    this.traceIfDebug(message);
  };

  public static internalServerError = (message?: string) => {
    this.json(
      {
        message: message ?? 'Internal server error',
      },
      500,
    );
    logger.error(
      chalk.red(LoggerLabel.ERROR_CONTROLLER),
      chalk.red('Internal server error: ' + message ?? 'Internal server error'),
    );
    this.traceIfDebug(message);
  };

  public static notImplemented = (message?: string) => {
    this.json(
      {
        message: message ?? 'Not implemented',
      },
      501,
    );
    logger.error(
      chalk.red(LoggerLabel.ERROR_CONTROLLER),
      chalk.red('Not implemented: ' + message ?? 'Not implemented'),
    );
    this.traceIfDebug(message);
  };

  public static databaseError = (message?: string) => {
    this.json(
      {
        message: message ?? 'Database error',
      },
      503,
    );
    logger.error(chalk.red(LoggerLabel.ERROR_CONTROLLER), chalk.red('Database error: ' + message ?? 'Database error'));
    this.traceIfDebug(message);
  };
}
