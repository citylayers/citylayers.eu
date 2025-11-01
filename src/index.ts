import { ServerConfig } from './types/ServerConfig';
import { ServerFactory } from './factories/ServerFactory';
import * as path from 'path';

class Application {
  private static instance: Application;

  private constructor() {}

  public static getInstance(): Application {
    if (!Application.instance) {
      Application.instance = new Application();
    }
    return Application.instance;
  }

  public async run(): Promise<void> {
    const config: ServerConfig = {
      port: parseInt(process.env.PORT || '8080', 10),
      host: process.env.HOST || '0.0.0.0'
    };

    const htmlPath = path.join(__dirname, '../public/index.html');
    const staticPath = path.join(__dirname, '../public');
    const factory = ServerFactory.getInstance();
    const server = factory.createServer(config, htmlPath, staticPath);

    await server.start();

    process.on('SIGINT', async () => {
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await server.stop();
      process.exit(0);
    });
  }
}

const app = Application.getInstance();
app.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
