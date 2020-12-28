import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { reducer as userReduce } from 'app/state/staff/staffSlice';
import { reducer as converReduce } from 'app/state/conver/converSlice';
import chatReducer from './chat/state/reducer';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    chat: chatReducer,
    user: userReduce,
    conver: converReduce,
  });
}
