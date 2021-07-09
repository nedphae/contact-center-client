import React from 'react';
import { render } from 'react-dom';
import { history, configuredStore } from './store';
import './app.global.css';

import './assets/css/material-dashboard-react.global.css?v=1.10.0';
import './assets/css/normalize.less';

const store = configuredStore();

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./HomePage').default;
  render(
    <Root store={store} history={history} />,
    document.getElementById('root')
  );
});
