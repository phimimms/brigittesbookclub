import { RUNTIME__START } from './dictionary/actions';
import Dispatcher from './helpers/Dispatcher';
import './helpers/State';

const context = require.context('components', true, /\.ts$/u);

Promise.all(context.keys().map((f) => context(f).default))
  .then((Components) => Components.map((Component) => new Component()))
  .then(() => Dispatcher.dispatch(RUNTIME__START));
