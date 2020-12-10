import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { reducer } from 'app/state/staff/staffSlice';
import chatReducer from './chat/state/reducer';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    chat: chatReducer,
    user: reducer,
  });
}
