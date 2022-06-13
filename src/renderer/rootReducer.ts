import { AnyAction, CombinedState, combineReducers } from 'redux';
import { reducer as staffReducer } from 'renderer/state/staff/staffSlice';
import { reducer as sessionReducer } from 'renderer/state/session/sessionSlice';
import { reducer as chatReducer } from 'renderer/state/chat/chatSlice';
import Chat from './domain/Chat';
import { SessionMap } from './domain/Session';
import StaffInfo from './domain/StaffInfo';

export default function createRootReducer() {
  const appReducer = combineReducers({
    chat: chatReducer,
    staff: staffReducer,
    session: sessionReducer,
  });

  const rootReducer = (
    state:
      | CombinedState<{
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
