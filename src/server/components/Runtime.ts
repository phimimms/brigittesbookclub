import { RUNTIME__END } from '../dictionary/actions';
import Dispatcher from '../helpers/Dispatcher';

export default class Runtime { // eslint-disable-line @typescript-eslint/no-extraneous-class

  constructor() {
    Runtime._onRegisterEventHandlers();
  }

  /**
   * Terminates the Node process.
   */
  private static _onEndProcess(): void {
    Dispatcher.dispatch(RUNTIME__END).then(() => process.exit()); // eslint-disable-line no-process-exit
  }

  /**
   * Subscribes to the events of the Node process.
   */
  private static _onRegisterEventHandlers(): void {
    process.stdin.resume();

    process.on('SIGINT', () => Runtime._onEndProcess());
    process.on('SIGUSR1', () => Runtime._onEndProcess());
    process.on('uncaughtException', () => Runtime._onEndProcess());

    // @ifdef DEVELOPMENT
    process.once('SIGUSR2', () => Dispatcher.dispatch(RUNTIME__END).then(() => process.kill(process.pid, 'SIGUSR2')));

    return;
    // @endif

    /* eslint-disable no-unreachable */
    process.on('SIGUSR2', () => Runtime._onEndProcess());
  }

}
