import { AppThunk, RootState } from 'app/store';
// import from userSlice
import { getCurrentStaff } from 'app/service/userService';
import { configFromStaff } from 'app/domain/StaffInfo';
import { useSelector } from 'react-redux';
import { generateRequest, WebSocketResponse } from 'app/domain/WebSocket';
import staffSlice from './staffSlice';

const { setStaff, setOnline } = staffSlice.actions;

// 异步请求
export const setUserAsync = (): AppThunk => async (dispatch) => {
  // dispatch() dispatch 等待动画
  const staff = await getCurrentStaff();
  dispatch(setStaff(staff));
};

export const getStaff = (state: RootState) => state.user;

export const configStaff = (socket: SocketIOClient.Socket): AppThunk => async (
  dispatch
) => {
  // 注册websocket 已经通过握手数据进行 jwt认证，直接注册客服状态
  const staff = useSelector(getStaff);
  const configRequest = generateRequest(configFromStaff(staff));
  // TODO: 添加超时
  socket.emit('register', configRequest, (data: WebSocketResponse<unknown>) => {
    if (data.code === 200) {
      // 注册成功, 设置状态同步成功
      dispatch(setOnline());
    }
  });
};
