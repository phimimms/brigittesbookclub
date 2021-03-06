import bodyParser from 'body-parser';
import chalk from 'chalk';
import compression from 'compression';
import express, { Application } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { Server } from 'http';
import passport from 'passport';
import path from 'path';

import { RUNTIME__END, RUNTIME__START } from '../dictionary/actions';
import Dispatcher from '../helpers/Dispatcher';
import User from '../models/User';
import authRoutes from '../routes/auth';
import bookRoutes from '../routes/book';
import userRoutes from '../routes/user';

export default class WebServer {

  /**
   * The maximum size of a request's body.
   */
  public static readonly PAYLOAD_LIMIT = '50mb';

  /**
   * The port number over which the service is available.
   */
  public static readonly PORT = process.env.PORT || '3000';

  /**
   * The Express application.
   */
  private _app: Application;

  /**
   * The Express server.
   */
  private _server: Server;

  constructor() {
    this._app = null;
    this._server = null;

    Dispatcher.on(RUNTIME__END, () => this._onEndServer(), this);
    Dispatcher.on(RUNTIME__START, () => this._onStartServer(), this);

    this._initializeApplication();
  }

  /**
   * Instantiates the Express application and configures its middleware & routes.
   */
  private _initializeApplication(): void {
    this._app = express();

    /* Adds HTTP Response Headers to Improve Security */
    this._app.use(helmet());

    /* Response Body Compression Middleware */
    this._app.use(compression());

    /* Parses the Body of the HTTP Request */
    this._app.use(bodyParser.json({ limit: WebServer.PAYLOAD_LIMIT }));
    this._app.use(bodyParser.urlencoded({ extended: false, limit: WebServer.PAYLOAD_LIMIT }));

    /* Provides Access to the Public Directory */
    this._app.use(express.static(path.resolve(__dirname, '../public')));

    /* Persists the user session between browser sessions */
    this._app.use(session({
      resave: false,
      saveUninitialized: false,
      secret: 'Br1gItT35b0oKcLuB',
    }));

    /* Configures Authentication */
    this._app.use(passport.initialize());
    this._app.use(passport.session());

    passport.serializeUser((user: typeof User, done) => done(null, user._id));
    passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));

    /* API Routers */
    this._app.use('/v1', authRoutes);
    this._app.use('/v1', bookRoutes);
    this._app.use('/v1', userRoutes);

    /* Homepage Route */
    this._app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../public/index.html'));
    });
  }

  /**
   * Stops the server from accepting new connections.
   */
  private _onEndServer(): void {
    if (!this._server) {
      return;
    }

    console.log(chalk.cyan.bold(`\nClosing ${chalk.blue(`http://localhost:${WebServer.PORT}`)}`));

    this._server.close();
    this._server = null;
  }

  /**
   * Starts the server to listen for connections.
   */
  private _onStartServer(): Promise<void> {
    return new Promise((resolve) => {
      this._server = this._app.listen(WebServer.PORT, () => {
        console.log(chalk.cyan.bold(`\nListening to ${chalk.blue(`http://localhost:${WebServer.PORT}`)}`));
        resolve();
      });
    })
      .then(() => {
        this._server.setTimeout(5000);
      });
  }

}
