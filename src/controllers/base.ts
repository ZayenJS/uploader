import chalk from 'chalk';
import { Response } from 'express';
import QueryString from 'qs';
import { EnhancedRequest } from '../@types/interfaces/EnhancedRequest';
import { LoggerLabel, logger } from '../services/logger';

type GenericStringObject = { [key: string]: string | undefined };

type KeyBodyReturn<T> = string | T;
type BodyReturn<T> = GenericStringObject | T;

type KeyQueryReturn<T> = string | QueryString.ParsedQs | undefined | T;
type ArrayQueryReturn<T> = string[] | QueryString.ParsedQs[] | undefined | T;
type QueryReturn<T> = KeyQueryReturn<T> | ArrayQueryReturn<T>;

type KeyParamsReturn<T> = string | T;
type ParamsReturn<T> = GenericStringObject | T;

export abstract class BaseController {
  protected static req: EnhancedRequest;
  protected static res: Response;

  public static init(req: EnhancedRequest, res: Response) {
    this.req = req;
    this.res = res;

    return this;
  }

  protected static getBody<T = GenericStringObject>(): BodyReturn<T>;
  protected static getBody<T = GenericStringObject>(key: string): KeyBodyReturn<T>;
  protected static getBody<T = GenericStringObject>(key?: string): BodyReturn<T> | KeyBodyReturn<T> {
    if (key) {
      // TODO? implement decorators to return the right type
      return this.req.body[key];
    }

    return this.req.body;
  }

  protected static getQuery<T = GenericStringObject>(): ArrayQueryReturn<T>;
  protected static getQuery<T = GenericStringObject>(key: string): KeyQueryReturn<T>;
  protected static getQuery<T = GenericStringObject>(key?: string): QueryReturn<T> {
    if (key) {
      return this.req.query[key];
    }

    return this.req.query;
  }

  protected static getParams<T = GenericStringObject>(): ParamsReturn<T>;
  protected static getParams<T = GenericStringObject>(key?: string): KeyParamsReturn<T>;
  protected static getParams<T = GenericStringObject>(key?: string): ParamsReturn<T> | KeyParamsReturn<T> {
    if (key) {
      return this.req.params[key];
    }

    return this.req.params as T | GenericStringObject;
  }

  protected static getFiles(): Express.Multer.File[];
  protected static getFiles(name: string): Express.Multer.File | undefined;
  protected static getFiles(name?: string): Express.Multer.File[] | Express.Multer.File | undefined {
    const files = this.req.files as Express.Multer.File[];

    if (name) {
      for (const file of files) {
        if (file.fieldname === name) {
          return file;
        }
      }

      return;
    }

    return files;
  }

  protected static getRequestData() {
    return {
      body: this.getBody(),
      query: this.getQuery(),
      params: this.getParams(),
      files: this.getFiles(),
    };
  }

  protected static getClientIp() {
    return this.req.ip;
  }

  protected static json<T>(data: T, code: number = 200) {
    return this.res.status(code).json({ ...data });
  }

  protected static send<T>(data: T, code: number = 200) {
    return this.res.status(code).send({ ...data });
  }

  protected static redirect(url: string) {
    return this.res.redirect(url);
  }

  protected static noContent() {
    logger.print(chalk.green(LoggerLabel.RESPONSE), 'No content');
    return this.res.status(204).send();
  }
}
