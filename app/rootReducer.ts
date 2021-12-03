import { AnyAction, CombinedState, combineReducers } from 'redux';
import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';
import { reducer as staffReducer } from 'app/state/staff/staffSlice';
import { reducer as sessionReducer } from 'app/state/session/sessionSlice';
import { reducer as chatReducer } from 'app/state/chat/chatSlice';
import Chat from './domain/Chat';
import { SessionMap } from './domain/Session';
import StaffInfo from './domain/StaffInfo';

export default function createRootReducer(history: History) {
  const appReducer = combineReducers({
    router: connectRouter(history),
    chat: chatReducer,
    staff: staffReducer,
    session: sessionReducer,
  });

  const rootReducer = (
    state:
      | CombinedState<{
          router: RouterState<History.PoorMansUnknown>;
          chat: Chat;
          staff: StaffInfo;
          session: SessionMap;
        }>
      | undefined,
    action: AnyAction
  ) => {
    if (action.type === 'CLEAR_ALL') {
      return appReducer(undefined, action);
    }
    return appReducer(state, action);
  };

  return rootReducer;
}
