import { createRoot } from 'react-dom/client';

import './i18n/i18n'; // 引用多语言配置文件
// import App from './App';
import HomePage from './HomePage';
import { history, configuredStore } from './store';
import './app.global.css';
import './assets/css/material-dashboard-react.global.css';
import './assets/css/normalize.less';

const store = configuredStore();

const container = document.getElementById('root');
if (container) {
  // 不使用懒加载,就需要在初始化代码时清除localStorage
  // eslint-disable-next-line global-require
  // const HomePage = require('./HomePage').default;
  const root = createRoot(container);
  root.render(
    // react-hotkeys 原因无法使用严格模式
    // <React.StrictMode>
    <HomePage store={store} history={history} />
    // </React.StrictMode>
  );
  // root.render(<App />);
}

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
