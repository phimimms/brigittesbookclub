import { RUNTIME__END } from '../dictionary/actions';
import Dispatcher from '../helpers/Dispatcher';

export default class Runtime {

  constructor() {
    this.onRegisterEventHandlers();
  }

  /**
   * Terminates the Node process.
   */
  onEndProcess(): void { // eslint-disable-line class-methods-use-this
    Dispatcher.dispatch(RUNTIME__END).then(() => process.exit()); // eslint-disable-line no-process-exit
  }

  /**
   * Subscribes to the events of the Node process.
   */
  onRegisterEventHandlers(): void {
    process.stdin.resume();

    process.on('SIGINT', () => this.onEndProcess());
    process.on('SIGUSR1', () => this.onEndProcess());
    process.on('uncaughtException', () => this.onEndProcess());

    // @ifdef DEVELOPMENT
    process.once('SIGUSR2', () => Dispatcher.dispatch(RUNTIME__END).then(() => process.kill(process.pid, 'SIGUSR2')));

    return;
    // @endif

    /* eslint-disable no-unreachable */
    process.on('SIGUSR2', () => this.onEndProcess());
  }

}
