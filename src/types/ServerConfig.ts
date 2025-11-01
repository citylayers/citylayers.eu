export interface ServerConfig {
  port: number;
  host: string;
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export enum ServerStatus {
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error'
}
