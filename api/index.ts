import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors({
      origin: true,
      credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    cachedApp = app;
  }
  return server;
}

export default async (req: Request, res: Response) => {
  const app = await bootstrap();
  app(req, res);
};
