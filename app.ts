import dotenv = require('dotenv');
dotenv.config();
import 'reflect-metadata';
import 'module-alias/register';
import * as express from 'express';
import { Cron } from '~/services/Cron';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { createConnection } from 'typeorm';
import { useExpressServer } from 'routing-controllers';
import { useMiddeware } from '~/utils/useMiddeware';
import { AuthorizationMiddleware } from '~/middlewares/Authorization';
import { ErrorHandlerMiddleware } from '~/middlewares/ErrorHandler';
import { MorganMiddleware } from '~/middlewares/Morgan';
import * as Sentry from '@sentry/node';
import config from '~/config';
import { Discord } from '~/services/Discord';
import * as cors from 'cors';

const start = async () => {
  const app = express();

  // db connection
  await createConnection();
  console.log('Database connection established.');

  // init discord client
  await Discord.initialize();
  console.log('Discord client initialized.');

  if (config.sentry.enabled) {
    Sentry.init({ dsn: config.sentry.dsn });
    app.use(Sentry.Handlers.requestHandler());

    console.log('Sentry initialize.');
  }

  // middewares
  app.use(bodyParser.json());
  app.use(
    cors({
      credentials: true,
      origin: [
        'http://test.online',
        'https://online.codingblocks.com',
        'https://online.codingblocks.xyz',
        'http://127.0.0.1:4200',
      ],
    }),
  );
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(compression());

  // add api controllers
  app.use('/api', useMiddeware(AuthorizationMiddleware));
  useExpressServer(app, {
    controllers: [__dirname + '/controllers/**/*.ts'],
    middlewares: [MorganMiddleware, ErrorHandlerMiddleware],
    defaultErrorHandler: false,
    validation: true,
  });

  app.listen(config.app.port, config.app.host, async () => {
    console.log(`Started server at http://${config.app.host}:${config.app.port}`);
  });

  config.cron.enabled && Cron.initialize();
};

start();
