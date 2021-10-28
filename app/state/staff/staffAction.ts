import { AppThunk, RootState } from 'app/store';
import { setAuthority } from 'app/utils/authority';
import { getCurrentStaff } from 'app/service/infoService';
import { configStatus } from 'app/domain/StaffInfo';
import { AccessToken } from 'app/domain/OauthToken';
import { register } from 'app/service/socketService';
import { OnlineStatus } from 'app/domain/constant/Staff';
import slice from './staffSlice';

export const { setStaff, setOnline, updateStatus } = slice.actions;
export const getStaff = (state: RootState) => {
  if (state.chat.monitored) {
    return state.chat.monitored.monitoredStaff;
  }
  return state.staff;
};

export const getMyself = (state: RootState) => state.staff;

export const getStaffToken = (state: RootState) => state.staff.token;

// 异步请求
export const setUserAsync =
  (
    token: AccessToken,
    onlineStatus: OnlineStatus = OnlineStatus.ONLINE
  ): AppThunk =>
  async (dispatch) => {
    setAuthority(
      token.authorities.map((role) => role.substring(5).toLowerCase())
    );
    // dispatch() dispatch 等待动画
    const staff = await getCurrentStaff();
    // 获取当前聊天会话列表，刷新页面后
    staff.token = token.source;
    staff.onlineStatus = onlineStatus;
    window.orgId = staff.organizationId;
    dispatch(setStaff(staff));
  };

export const configStaff = (): AppThunk => {
  return (dispatch, getState) => {
    // 注册websocket 已经通过握手数据进行 jwt认证，直接注册客服状态
    // const staff = getStaff(getState()); // useSelector(getStaff);
    register(
      configStatus(
        getState().staff.prevOnlineStatus ?? OnlineStatus.ONLINE,
        getState().staff.groupId
      )
    ).subscribe(() => {
      // 注册成功, 设置状态同步成功
      dispatch(setOnline());
    });
  };
};
