import { Express, Request, Response } from 'express';
import { RouteHandler } from './RouteHandler';
import { ILogger } from '../services/Logger';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

interface Route {
  path: string;
  method: HttpMethod;
  handler: RouteHandler;
}

export class RouteRegistry {
  private readonly routes: Map<string, Route>;
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.routes = new Map();
    this.logger = logger;
  }

  public register(path: string, method: HttpMethod, handler: RouteHandler): void {
    const key = this.getRouteKey(path, method);
    this.routes.set(key, { path, method, handler });
    this.logger.info(`Route registered: ${method} ${path}`);
  }

  public applyRoutes(app: Express): void {
    this.routes.forEach((route) => {
      const methodHandlers: Record<HttpMethod, (path: string, handler: (req: Request, res: Response) => void) => void> = {
        [HttpMethod.GET]: app.get.bind(app),
        [HttpMethod.POST]: app.post.bind(app),
        [HttpMethod.PUT]: app.put.bind(app),
        [HttpMethod.DELETE]: app.delete.bind(app),
        [HttpMethod.PATCH]: app.patch.bind(app)
      };

      const expressMethod = methodHandlers[route.method];
      expressMethod(route.path, (req: Request, res: Response) => {
        route.handler.handle(req, res);
      });
    });

    this.logger.info(`Applied ${this.routes.size} routes to Express app`);
  }

  private getRouteKey(path: string, method: HttpMethod): string {
    return `${method}:${path}`;
  }
}
