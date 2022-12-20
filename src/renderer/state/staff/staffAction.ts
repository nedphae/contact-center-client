import { AppThunk, RootState } from 'renderer/store';
import { getCurrentStaff } from 'renderer/service/infoService';
import Staff, { configStatus } from 'renderer/domain/StaffInfo';
import { AccessToken } from 'renderer/domain/OauthToken';
import { register } from 'renderer/service/socketService';
import { OnlineStatusKey } from 'renderer/domain/constant/Staff';
import { filter, interval, map, Subscription } from 'rxjs';
import { AxiosError } from 'axios';
import { setAuthority } from 'renderer/utils/authority';
import slice from './staffSlice';
import { setSnackbarProp } from '../chat/chatAction';

export const {
  setStaff,
  setOnline,
  updateOnlineStatusBySocket,
  clearToken,
  updateToken,
} = slice.actions;
export const getStaff = (state: RootState) => {
  if (state.chat.monitored) {
    return state.chat.monitored.monitoredStaff;
  }
  return state.staff;
};

export const getMyself = (state: RootState) => state.staff;

export const getStaffToken = (state: RootState) => state.staff.token;

let statueInterval: Subscription | undefined;

// 异步请求
export const setUserAsync =
  (token: AccessToken, onlineStatus: OnlineStatusKey = 'ONLINE'): AppThunk =>
  async (dispatch, getState) => {
    // substring 用于清除 ROLE_ 前缀
    setAuthority(
      token.authorities.map((role) => role.substring(5).toLowerCase())
    );
    try {
      // dispatch() dispatch 等待动画
      const staff = await getCurrentStaff();
      // 获取当前聊天会话列表，刷新页面后
      staff.token = token.source;
      staff.onlineStatus = onlineStatus;
      window.orgId = staff.organizationId;
      if (getMyself(getState()).id !== staff.id) {
        // 不是同一个用户登录就清空所有缓存
        dispatch({ type: 'CLEAR_ALL' });
      }
      dispatch(setStaff(staff));
    } catch (error: unknown) {
      if ((error as AxiosError<Staff>)?.response?.status === 402) {
        // console.info('response: %o', error.response);
        dispatch(
          setSnackbarProp({
            open: true,
            message: 'Your account has expired, please use it after renewal',
            severity: 'error',
            autoHideDuration: undefined,
          })
        );
      } else {
        dispatch(
          setSnackbarProp({
            open: true,
            message: 'Failed to get user information',
            severity: 'error',
            autoHideDuration: undefined,
          })
        );
      }
    }
  };

export const configBase = (runAfter?: AppThunk): AppThunk => {
  return (dispatch, getState) => {
    // 注册websocket 已经通过握手数据进行 jwt认证，直接注册客服状态
    // const staff = getStaff(getState()); // useSelector(getStaff);
    register<Staff>(
      configStatus(
        getState().staff.prevOnlineStatus ?? getState().staff.onlineStatus,
        getState().staff.groupId
      )
    ).subscribe((staffResponse) => {
      if (staffResponse.body) {
        if (
          staffResponse.body.onlineStatus === 'OFFLINE' &&
          getState().staff.onlineStatus !== staffResponse.body.onlineStatus
        ) {
          // 在线人数超过限制
          dispatch(
            setSnackbarProp({
              open: true,
              message:
                'The number of online customer service has reached the upper limit, please try again later',
              severity: 'warning',
            })
          );
        }
        // 注册成功, 设置状态同步成功
        dispatch(setOnline(staffResponse.body.onlineStatus));
        if (runAfter && staffResponse.body.onlineStatus === 'ONLINE') {
          dispatch(runAfter);
        }
      }
    });
  };
};

export const intervalConfigStaff = (): AppThunk => {
  return (dispatch, getState) => {
    if (statueInterval) {
      statueInterval.unsubscribe();
      statueInterval = undefined;
    }
    if (getState().staff.onlineStatus !== 'OFFLINE') {
      statueInterval = interval(300000)
        .pipe(
          map(() => getState().staff.onlineStatus),
          filter((onlineStatus) => onlineStatus !== 'OFFLINE')
        )
        .subscribe(() => {
          dispatch(configBase());
        });
    }
  };
};

export const configStaff = (): AppThunk => {
  return configBase(intervalConfigStaff());
};

export const setOnlineAndInterval = (
  onlineStatus: OnlineStatusKey
): AppThunk => {
  return (dispatch) => {
    dispatch(setOnline(onlineStatus));
    dispatch(intervalConfigStaff());
  };
};
