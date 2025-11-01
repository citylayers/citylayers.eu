import { Request, Response } from 'express';

export abstract class RouteHandler {
  abstract handle(req: Request, res: Response): void | Promise<void>;
}

export class RootRouteHandler extends RouteHandler {
  private readonly htmlContent: string;

  constructor(htmlContent: string) {
    super();
    this.htmlContent = htmlContent;
  }

  public handle(req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/html');
    res.send(this.htmlContent);
  }
}
