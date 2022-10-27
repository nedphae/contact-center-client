import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  getAccessToken,
  getOnlineStatus,
  refreshToken,
} from 'renderer/electron/jwtStorage';
import { clearToken, setUserAsync } from 'renderer/state/staff/staffAction';
import { AccessToken } from 'renderer/domain/OauthToken';

interface AutoLoginResult {
  savedToken?: AccessToken;
}

const useAutoLogin = (authPage = false): AutoLoginResult => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [savedToken, setSavedToken] = useState<AccessToken>();
  /**
   * 自动刷新 Token
   */
  const getTokenCall = useCallback(async () => {
    const onlineStatus = getOnlineStatus() ?? 'ONLINE';
    let token: AccessToken | undefined;
    try {
      token = await getAccessToken();
      if (token) {
        dispatch(setUserAsync(token, onlineStatus));
      } else {
        // 如果没有 token 就清除缓存的 token
        dispatch(clearToken());
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
      setSavedToken(token);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  }, [authPage, dispatch, navigate]);

  useEffect(() => {
    let didCancel = false;
    if (!didCancel) {
      getTokenCall();
    }

    return () => {
      didCancel = true;
    };
  }, [dispatch, getTokenCall]);
  return { savedToken };
};

export default useAutoLogin;
