import React from 'react';
import { render } from 'react-dom';
import { history, configuredStore } from './store';
import './app.global.css';

import 'assets/css/material-dashboard-react.css?v=1.8.0';
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
