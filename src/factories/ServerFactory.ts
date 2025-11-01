import { ServerConfig } from '../types/ServerConfig';
import { ConsoleLogger, ILogger } from '../services/Logger';
import { RouteRegistry } from '../routes/RouteRegistry';
import { HttpServer, IServer } from '../server/HttpServer';
import { HttpMethod } from '../routes/RouteRegistry';
import { RootRouteHandler } from '../routes/RouteHandler';
import * as fs from 'fs';
import * as path from 'path';

export class ServerFactory {
  private static instance: ServerFactory;

  private constructor() {}

  public static getInstance(): ServerFactory {
    if (!ServerFactory.instance) {
      ServerFactory.instance = new ServerFactory();
    }
    return ServerFactory.instance;
  }

  public createServer(config: ServerConfig, htmlPath: string, staticPath?: string): IServer {
    const logger: ILogger = ConsoleLogger.getInstance();
    const routeRegistry = new RouteRegistry(logger);

    const htmlContent = this.loadHtmlContent(htmlPath);
    const rootHandler = new RootRouteHandler(htmlContent);

    routeRegistry.register('/', HttpMethod.GET, rootHandler);

    return new HttpServer(config, logger, routeRegistry, staticPath);
  }

  private loadHtmlContent(htmlPath: string): string {
    try {
      const fullPath = path.resolve(htmlPath);
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load HTML file from ${htmlPath}: ${error}`);
    }
  }
}
