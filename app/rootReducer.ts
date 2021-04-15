import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { reducer as userReducer } from 'app/state/staff/staffSlice';
import { reducer as sessionReducer } from 'app/state/session/sessionSlice';
import { reducer as chatReducer } from 'app/state/chat/chatSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    chat: chatReducer,
    user: userReducer,
    session: sessionReducer,
  });
}
