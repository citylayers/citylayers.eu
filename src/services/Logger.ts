import { LogLevel } from '../types/ServerConfig';

export abstract class ILogger {
  abstract log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
  abstract debug(message: string, meta?: Record<string, unknown>): void;
  abstract info(message: string, meta?: Record<string, unknown>): void;
  abstract warning(message: string, meta?: Record<string, unknown>): void;
  abstract error(message: string, meta?: Record<string, unknown>): void;
}

export class ConsoleLogger extends ILogger {
  private static instance: ConsoleLogger;

  private constructor() {
    super();
  }

  public static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }

  public log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[${timestamp}] [${level}] ${message}${metaStr}`);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  public warning(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.WARNING, message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, meta);
  }
}
