import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { history } from 'app/store';
import {
  getAccessToken,
  getOnlineStatus,
  refreshToken,
} from 'app/electron/jwtStorage';
import { setUserAsync } from 'app/state/staff/staffAction';

const useAutoLogin = (authPage = false) => {
  const dispatch = useDispatch();
  /**
   * 自动刷新 Token
   */
  const getTokenCall = useCallback(async () => {
    let token;
    const onlineStatus = parseInt(getOnlineStatus() ?? '1', 10);
    try {
      token = await getAccessToken();
      if (token) {
        dispatch(setUserAsync(token, onlineStatus));
      }
    } catch (error) {
      // 刷新token
      token = await refreshToken();
      if (token) {
        dispatch(setUserAsync(token, onlineStatus));
      }
    }
    // 没有任何异常就跳转
    if (token && authPage) {
      history.push('/');
    }
  }, [dispatch, authPage]);

  useEffect(() => {
    let didCancel = false;
    if (!didCancel) {
      getTokenCall();
    }

    return () => {
      didCancel = true;
    };
  }, [dispatch, getTokenCall]);
};

export default useAutoLogin;
