import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import path from 'path';

import Dispatcher from '../helpers/Dispatcher';
import { RUNTIME__END, RUNTIME__START } from '../dictionary/actions';

export default class Server {

  public static payloadLimit = '50mb';

  public static port = process.env.PORT || 3000;

  private _app;

  private _server;

  constructor() {
    this._app = null;
    this._server = null;

    Dispatcher.on(RUNTIME__END, this.onEndServer, this);
    Dispatcher.on(RUNTIME__START, this.onStartServer, this);

    this.initializeApplication();
  }

  /**
   * Instantiates the Express application and configures its middleware & routes.
   */
  initializeApplication(): void {
    this._app = express();

    /* Response Body Compression Middleware */
    this._app.use(compression());

    /* Parses the Body of the HTTP Request */
    this._app.use(bodyParser.json({ limit: Server.payloadLimit }));
    this._app.use(bodyParser.urlencoded({ extended: false, limit: Server.payloadLimit }));

    /* Provides Access to the Public Directory */
    this._app.use(express.static(path.resolve(__dirname, '../public')));

    /* Homepage Route */
    this._app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../public/index.html'));
    });
  }

  /**
   * Stops the server from accepting new connections.
   */
  onEndServer(): void {
    if (!this._server) {
      return;
    }

    console.log(`\nClosing http://localhost:${Server.port}`);

    this._server.close();
    this._server = null;
  }

  /**
   * Starts the server to listen for connections.
   */
  onStartServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._server = this._app.listen(Server.port, (err) => {
        if (err) {
          console.log('Failed to start the server:', err);
          reject(err);

          return;
        }

        console.log(`\nListening to http://localhost:${Server.port}`);
        resolve();
      });
    })
      .then(() => this._server.setTimeout(5000));
  }

}
