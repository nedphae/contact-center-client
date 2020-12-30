import { AppThunk, RootState } from 'app/store';
import clientConfig from 'app/config/clientConfig';
import { setAuthority } from 'app/utils/authority';
import { getCurrentStaff } from 'app/service/infoService';
import { configFromStaff } from 'app/domain/StaffInfo';
import { generateRequest, WebSocketResponse } from 'app/domain/WebSocket';
import { AccessToken } from 'app/domain/OauthToken';
import slice from './staffSlice';

const { setStaff, setOnline } = slice.actions;
export const getStaff = (state: RootState) => state.user;

// 异步请求
export const setUserAsync = (token: AccessToken): AppThunk => async (
  dispatch
) => {
  // 把 token 保存到 localStorage
  localStorage.setItem(
    clientConfig.oauth.accessTokenName,
    JSON.stringify(token)
  );
  setAuthority(
    token.authorities.map((role) => role.substring(5).toLowerCase())
  );
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
