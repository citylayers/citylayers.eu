import express, { Express } from 'express';
import { ServerConfig, ServerStatus } from '../types/ServerConfig';
import { ILogger } from '../services/Logger';
import { RouteRegistry } from '../routes/RouteRegistry';

export abstract class IServer {
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract getStatus(): ServerStatus;
}

export class HttpServer extends IServer {
  private readonly app: Express;
  private readonly config: ServerConfig;
  private readonly logger: ILogger;
  private readonly routeRegistry: RouteRegistry;
  private readonly staticPath?: string;
  private status: ServerStatus;

  constructor(config: ServerConfig, logger: ILogger, routeRegistry: RouteRegistry, staticPath?: string) {
    super();
    this.app = express();
    this.config = config;
    this.logger = logger;
    this.routeRegistry = routeRegistry;
    this.staticPath = staticPath;
    this.status = ServerStatus.STOPPED;
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    if (this.staticPath) {
      this.app.use(express.static(this.staticPath));
      this.logger.info('Static file serving enabled', { path: this.staticPath });
    }
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  public async start(): Promise<void> {
    try {
      this.status = ServerStatus.STARTING;
      this.logger.info('Starting HTTP server...', {
        port: this.config.port,
        host: this.config.host
      });

      this.routeRegistry.applyRoutes(this.app);

      await new Promise<void>((resolve, reject) => {
        this.app.listen(this.config.port, this.config.host, () => {
          this.status = ServerStatus.RUNNING;
          this.logger.info('HTTP server started successfully', {
            url: `http://${this.config.host}:${this.config.port}`
          });
          resolve();
        }).on('error', (error) => {
          this.status = ServerStatus.ERROR;
          this.logger.error('Failed to start HTTP server', { error: error.message });
          reject(error);
        });
      });
    } catch (error) {
      this.status = ServerStatus.ERROR;
      throw error;
    }
  }

  public async stop(): Promise<void> {
    this.logger.info('Stopping HTTP server...');
    this.status = ServerStatus.STOPPED;
  }

  public getStatus(): ServerStatus {
    return this.status;
  }
}
