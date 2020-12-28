import { AppThunk, RootState } from 'app/store';
import { getCurrentStaff } from 'app/service/infoService';
import { configFromStaff } from 'app/domain/StaffInfo';
import { generateRequest, WebSocketResponse } from 'app/domain/WebSocket';
import slice from './staffSlice';

const { setStaff, setOnline } = slice.actions;
export const getStaff = (state: RootState) => state.user;

// 异步请求
export const setUserAsync = (): AppThunk => async (dispatch) => {
  // dispatch() dispatch 等待动画
  const staff = await getCurrentStaff();
  dispatch(setStaff(staff));
};

export const configStaff = (): AppThunk => {
  return async (dispatch, getState) => {
    // 注册websocket 已经通过握手数据进行 jwt认证，直接注册客服状态
    const staff = getStaff(getState()); // useSelector(getStaff);
    const configRequest = generateRequest(configFromStaff(staff));
    // TODO: 添加超时
    window.socketRef.emit(
      'register',
      configRequest,
      (data: WebSocketResponse<unknown>) => {
        if (data.code === 200) {
          // 注册成功, 设置状态同步成功
          dispatch(setOnline());
        }
      }
    );
  };
};
