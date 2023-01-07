import { NextFunction, Response } from 'express';
import { EnhancedRequest } from '../@types/interfaces/EnhancedRequest';

export const tryCatcher = (fn: Function) => async (req: EnhancedRequest, res: Response, next: NextFunction) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};
