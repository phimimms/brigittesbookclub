import chalk from 'chalk';
import mongoose from 'mongoose';

import { RUNTIME__END, RUNTIME__START } from '../dictionary/actions';
import Dispatcher from '../helpers/Dispatcher';
import State from '../helpers/State';

export default class Database {

  /**
   * The host address of the MongoDB connection.
   */
  public static readonly ADDRESS = process.env.DOCKER_MONGO_ADDRESS || 'localhost';

  /**
   * The port of the MongoDB connection.
   */
  public static readonly PORT = 27017;

  /**
   * The duration of time in milliseconds between attempts to reconnect to MongoDB.
   */
  public static readonly RECONNECT_TIMEOUT_DURATION = 15000;

  /**
   * Indicates whether the service is connected to MongoDB.
   */
  private _connected: boolean;

  /**
   * The number of consecutive times the service has attempted to reconnect to MongoDB.
   */
  private _reconnectAttempts: number;

  /**
   * The identifier of the timeout to reconnect to MongoDB after the reconnection timeout period has elapsed.
   */
  private _reconnectTimeout: NodeJS.Timeout;

  constructor() {
    this._connected = false;
    this._reconnectAttempts = 0;
    this._reconnectTimeout = null;

    Dispatcher.on(RUNTIME__END, () => this._onDisconnectDatabase(), this);
    Dispatcher.on(RUNTIME__START, () => this._onConnectDatabase(), this);

    mongoose.set('useFindAndModify', false);

    this._onRegisterEventHandlers();
  }

  /**
   * Cancels reconnection to MongoDB.
   */
  private _onCancelReconnection(): void {
    clearTimeout(this._reconnectTimeout);
    this._reconnectTimeout = null;
  }

  /**
   * Connects to MongoDB.
   */
  private _onConnectDatabase(): void { // eslint-disable-line class-methods-use-this
    mongoose.connect(`mongodb://${Database.ADDRESS}:${Database.PORT}/brigittesbookclub`, {
      useCreateIndex: true,
      useNewUrlParser: true,
    });
  }

  /**
   * Disconnects from MongoDB.
   */
  private _onDisconnectDatabase(): Promise<void> {
    this._onCancelReconnection();

    return mongoose.connection.close();
  }

  /**
   * Connects to MongoDB after the reconnection timeout period has elapsed.
   */
  private _onReconnectDatabase(): void {
    if (this._reconnectTimeout) {
      return;
    }

    this._reconnectAttempts += 1;

    const durationInSeconds = Database.RECONNECT_TIMEOUT_DURATION / 1000;
    const reconnectingMessage = `\n${chalk.bold('Reconnecting to MongoDB')} in ${durationInSeconds} seconds`;
    console.log(chalk.cyan(`${reconnectingMessage}... (${this._reconnectAttempts})`));

    this._reconnectTimeout = global.setTimeout(() => this._onConnectDatabase(), Database.RECONNECT_TIMEOUT_DURATION);
  }

  /**
   * Subscribes to the events of the MongoDB connection.
   */
  private _onRegisterEventHandlers(): void {
    mongoose.connection.on('connected', () => {
      this._connected = true;

      this._onCancelReconnection();
      this._reconnectAttempts = 0;

      console.log(chalk.cyan.bold('\nConnected to MongoDB'));
    });

    mongoose.connection.on('disconnected', () => {
      if (this._connected) {
        console.log(chalk.cyan.bold('\nDisconnected from MongoDB'));

        if (State.running) {
          this._onReconnectDatabase();
        }
      }

      this._connected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.log(chalk.red(`\n${'MongoDB Error'.bold}:`), err);

      this._onDisconnectDatabase().then(() => this._onReconnectDatabase());
    });
  }

}
