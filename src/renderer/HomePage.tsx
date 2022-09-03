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

import { createContext, Suspense, useMemo, useState } from 'react';

import { Provider } from 'react-redux';
import {
  unstable_HistoryRouter as HistoryRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { History } from 'history';
import { ApolloProvider } from '@apollo/client';
import { HotKeys } from 'react-hotkeys';

import { createTheme, ThemeProvider } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import Authorized from 'renderer/utils/Authorized';
import { Store } from './store';
// core components
import Admin from './layouts/Admin';
import RTL from './layouts/RTL';
import Auth from './layouts/Auth';
// import useApolloClient from './hook/init/useApolloClient';
import apolloClient from './utils/apolloClient';
import routes from './routes';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const switchRoutes = routes.map((prop) => {
  if (prop.layout === '/admin') {
    return (
      <Route
        path={prop.layout + prop.path}
        element={(
          <Authorized
            authority={['admin', 'staff', 'leader', 'qa']}
            noMatch={<Navigate to="/login" />}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <prop.component />
            </Suspense>
          </Authorized>
        )}
        key={prop.layout + prop.path}
      />
    );
  }
  return null;
});

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

const Root = ({ store, history }: Props) => {
  const themeType =
    localStorage.getItem('themeType') === 'dark' ? 'dark' : 'light';
  const [mode, setMode] = useState<'light' | 'dark'>(themeType);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const currentMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeType', currentMode);
          return currentMode;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      mode === 'dark'
        ? createTheme({
            palette: {
              type: 'dark',
              primary: blue,
            },
          })
        : createTheme(),
    [mode]
  );
  // check login
  return (
    <Provider store={store}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <HistoryRouter history={history}>
            <Routes>
              {/* 原来的路由 */}
              <Route path="/login" element={<Auth />} />
              <Route path="/admin" element={<AdminContainer />}>
                {/* 添加权限的路由 */}
                {switchRoutes}
              </Route>
              <Route
                path="*"
                element={<Navigate to="/admin/entertain" replace />}
              />
            </Routes>
          </HistoryRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Provider>
  );
};

export default Root;
