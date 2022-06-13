import { configureStore, Action, Middleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import createRootReducer from './rootReducer';

const rootReducer = createRootReducer();
export type RootState = ReturnType<typeof rootReducer>;

const middleware: Middleware[] = [];

const excludeLoggerEnvs = ['test', 'production'];
const shouldIncludeLogger = !excludeLoggerEnvs.includes(
  process.env.NODE_ENV || '',
);

if (shouldIncludeLogger) {
  const logger = createLogger({
    level: 'info',
    collapsed: true,
  });
  middleware.push(logger);
}

export const configuredStore = (initialState?: RootState) => {
  // Create Store
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...middleware),
    preloadedState: initialState,
  });

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept(
      './rootReducer',
      // eslint-disable-next-line global-require
      () => store.replaceReducer(require('./rootReducer').default),
    );
  }
  return store;
};
export type Store = ReturnType<typeof configuredStore>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
