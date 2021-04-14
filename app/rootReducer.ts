import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { reducer as userReduce } from 'app/state/staff/staffSlice';
import { reducer as sessionReduce } from 'app/state/session/sessionSlice';
import { reducer as chatReduce } from 'app/state/chat/chatSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    chat: chatReduce,
    user: userReduce,
    session: sessionReduce,
  });
}
