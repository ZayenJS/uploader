import { Request, Response, Router } from 'express';
import { BaseController } from '../controllers/base';
import { ErrorController } from '../controllers/error';

import baseRouter from './base';

import { EnhancedRequest } from '../@types/interfaces/EnhancedRequest';
import { Uploader } from '../services/uploader';
import { logger, LoggerLabel } from '../services/logger';

const router = Router();

router.use((req: Request, res: Response, next) => {
  logger.print(LoggerLabel.ROUTER, `Incoming request: ${req.method} ${req.url}`);
  BaseController.init(req as EnhancedRequest, res);
  Uploader.init(req as EnhancedRequest, res);

  next();
});

router.use(baseRouter).use(() => ErrorController.notFound('Route not found'));

export default router;
