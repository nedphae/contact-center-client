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
import { History } from 'history';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import apolloClient from 'app/utils/apolloClient';
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
const Root = ({ store, history }: Props) => {
  // check login
  return (
    <ApolloProvider client={apolloClient}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route path="/admin" component={Admin} />
            <Route path="/rtl" component={RTL} />
            <Redirect from="/" to="/admin/entertain" />
            {/* 原来的路由 */}
            <Route path="/login" component={Auth} />
            {/* 添加权限的路由 */}
            <Authorized
              authority={['admin']}
              noMatch={
                <Route path="/" render={() => <Redirect to="/login" />} />
              }
            >
              <Route path="/admin" component={Admin} />
              <Route path="/rtl" component={RTL} />
              <Redirect from="/" to="/admin/entertain" />
            </Authorized>
          </Switch>
        </ConnectedRouter>
      </Provider>
    </ApolloProvider>
  );
};

export default Root;
