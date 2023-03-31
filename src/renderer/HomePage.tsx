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

import {
  createStyles,
  createTheme,
  CssBaseline,
  makeStyles,
  Theme,
  ThemeProvider,
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { blue } from '@material-ui/core/colors';
import Authorized from 'renderer/utils/Authorized';
import { Store } from './store';
// core components
import Admin from './layouts/Admin';
import RTL from './layouts/RTL';
import Auth from './layouts/Auth';
// import useApolloClient from './hook/init/useApolloClient';
import apolloClient from './utils/apolloClient';
import useRoutes from './useRoutes';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const keyMap = {
  // 关闭当前会话(隐藏)
  ESC_NODE: 'esc',
  // 切换至等待时间最长的会话
  SWITCH_NODE: 'ctrl+tab',
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    '@global': {
      '*::-webkit-scrollbar': {
        backgroundColor: theme.palette.type === 'light' ? '#f1f1f1' : '#202022',
        width: '12px',
      },
      '*::-webkit-scrollbar-corner': {
        backgroundColor: theme.palette.type === 'light' ? '#f1f1f1' : '#202022',
      },
      '*::-webkit-scrollbar-thumb': {
        border:
          theme.palette.type === 'light'
            ? '2px solid #f1f1f1'
            : '2px solid #202022',
        minHeight: '24px',
        borderRadius: '8px',
        backgroundColor: theme.palette.type === 'light' ? '#c1c1c1' : '#585859',
      },
    },
  })
);

function AdminContainer() {
  // const [apolloClient] = useApolloClient();
  const classes = useStyles();

  return (
    <>
      {apolloClient && (
        <HotKeys keyMap={keyMap}>
          <ApolloProvider client={apolloClient}>
            <CssBaseline classes={classes} />
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

  const routes = useRoutes();
  const switchRoutes = routes.map((prop) => {
    if (prop.layout === '/admin') {
      return (
        <Route
          path={prop.layout + prop.path}
          element={
            <Authorized
              authority={['admin', 'staff', 'leader', 'qa']}
              noMatch={<Navigate to="/login" />}
            >
              <Suspense
                fallback={
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={50} thickness={4} value={100} />
                  </div>
                }
              >
                <prop.component />
              </Suspense>
            </Authorized>
          }
          key={prop.layout + prop.path}
        />
      );
    }
    return null;
  });

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
                element={<Navigate to="/admin/chat" replace />}
              />
            </Routes>
          </HistoryRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Provider>
  );
};

export default Root;
