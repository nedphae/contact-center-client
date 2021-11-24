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
import { ApolloProvider } from '@apollo/client';
import { HotKeys } from 'react-hotkeys';

import { createTheme, ThemeProvider } from '@material-ui/core';
import { lightBlue } from '@material-ui/core/colors';
import { Store } from './store';
// core components
import Admin from './layouts/Admin';
import RTL from './layouts/RTL';
import Auth from './layouts/Auth';
import Authorized from './components/Authorized/Authorized';
// import useApolloClient from './hook/init/useApolloClient';
import apolloClient from './utils/apolloClient';

const keyMap = {
  // 关闭当前会话(隐藏)
  ESC_NODE: 'esc',
  // 切换至等待时间最长的会话
  SWITCH_NODE: 'ctrl+tab',
};

function AdminContainer() {
  // const [apolloClient] = useApolloClient();
  return (
    <>
      {apolloClient && (
        <HotKeys keyMap={keyMap}>
          <ApolloProvider client={apolloClient}>
            <Admin />
          </ApolloProvider>
        </HotKeys>
      )}
    </>
  );
}

type Props = {
  store: Store;
  history: History;
};

const darkTheme = createTheme({
  palette: {
    type: 'dark',
    primary: lightBlue,
  },
});

const Root = ({ store, history }: Props) => {
  // check login
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <ThemeProvider theme={darkTheme}>
          <Switch>
            {/* 原来的路由 */}
            <Route path="/login" component={Auth} />
            {/* 添加权限的路由 */}
            <Authorized
              authority={['admin']}
              noMatch={
                <Route path="/" render={() => <Redirect to="/login" />} />
              }
            >
              <Route path="/admin" component={AdminContainer} />
              <Route path="/rtl" component={RTL} />
              <Redirect from="/" to="/admin/entertain" />
            </Authorized>
          </Switch>
        </ThemeProvider>
      </ConnectedRouter>
    </Provider>
  );
};

export default Root;
