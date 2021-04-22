import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { history } from 'app/store';
import { getAccessToken, refreshToken } from 'app/electron/jwtStorage';
import { setUserAsync } from 'app/state/staff/staffAction';

const useAutoLogin = (authPage = false) => {
  const dispatch = useDispatch();
  /**
   * 自动刷新 Token
   */
  const getTokenCall = useCallback(async () => {
    try {
      const token = await getAccessToken();
      dispatch(setUserAsync(token));
    } catch (error) {
      // 刷新token
      const newToken = await refreshToken();
      dispatch(setUserAsync(newToken));
    }
    // 没有任何异常就跳转
    if (authPage) {
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
