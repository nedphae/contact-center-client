/*!

=========================================================
* 客服系统前端项目 - v0.1.0
=========================================================

* 基于 Material-UI 开发
*
*

* Coded by Wanli Gao

=========================================================

* 开源协议：

*/

import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Store } from './store';
// core components
import Admin from './layouts/Admin';
import RTL from './layouts/RTL';
import Auth from './layouts/Auth';
import Authorized from './components/Authorized/Authorized';

type Props = {
  store: Store;
  history: History;
};
const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        {/* 原来的路由 */}
        <Route path="/login" component={Auth} />
        <Authorized
          authority={['admin']}
          noMatch={<Route path="/" render={() => <Redirect to="/login" />} />}
        >
          {/* 添加权限的路由 */}
          <Route path="/admin" component={Admin} />
          <Route path="/rtl" component={RTL} />
        </Authorized>
        <Redirect from="/" to="/admin/entertain" />
      </Switch>
    </ConnectedRouter>
  </Provider>
);

export default hot(Root);
