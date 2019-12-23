import './style.css';

import('components/App')
  .then(({ default: App }) => new App({
    target: document.getElementById('root'),
  }));
