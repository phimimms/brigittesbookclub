/**
 * The entity responsible for the subscription to the action.
 */
type Subscriber = object|string;

/**
 * The action subscription.
 */
interface Subscription {

  /**
   * The callback function of the subscription.
   */
  readonly callback: Function;

  /**
   * The entity responsible for the subscription to the action.
   * If specified as an object, the subscriber is explicitly bound as the context object of the callback invocation.
   */
  readonly subscriber: Subscriber;

}

class Dispatcher {

  /**
   * The map of event names to subscriptions.
   */
  private _subscriptions: Map<string, Subscription[]>;

  constructor() {
    this._subscriptions = new Map();
  }

  /**
   * Invokes all subscriptions to the action type.
   * @param action  The action type.
   * @param payload The payload of the action.
   */
  dispatch(action: string, payload: {} = {}): Promise<void> {
    const subscriptions = this._subscriptions.get(action);

    if (!subscriptions) {
      return Promise.resolve();
    }

    return Promise.all(subscriptions.map(({ callback, subscriber }) => {
      if (typeof subscriber === 'string') {
        return callback(payload);
      }

      return callback.call(subscriber, payload);
    }))
      .then(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
  }

  /**
   * Unsubscribes the callback function registered by the subscriber of the action.
   * @param action      The action type.
   * @param subscriber  The entity responsible for the subscription to the action.
   */
  off(action: string, subscriber: Subscriber): void {
    let subscriptions = this._subscriptions.get(action) || [];

    subscriptions = subscriptions.filter(({ subscriber: s }) => s !== subscriber);

    this._subscriptions.set(action, subscriptions);

    if (!subscriptions.length) {
      this._subscriptions.delete(action);
    }
  }

  /**
   * Subscribes the callback function to the action.
   * @param action      The action type.
   * @param callback    The subscription function.
   * @param subscriber  The entity responsible for the subscription to the action.
   */
  on(action: string, callback: Function, subscriber: Subscriber): void {
    const subscriptions = this._subscriptions.get(action) || [];

    subscriptions.push({
      callback,
      subscriber,
    });

    this._subscriptions.set(action, subscriptions);
  }

}

export default new Dispatcher();
