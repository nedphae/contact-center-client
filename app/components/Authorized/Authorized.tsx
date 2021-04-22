/**
 * Authorized 元素权限配置
 * 搭配 JWT 进行 OAuth2 认证
 */
import React, { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getToken, refreshToken, saveToken } from 'app/electron/jwtStorage';
import { setUserAsync } from 'app/state/staff/staffAction';
import Snackbar from '../Snackbar/Snackbar';
import check, { IAuthorityType } from './CheckPermissions';

import AuthorizedRoute from './AuthorizedRoute';
import Secured from './Secured';

interface AuthorizedProps {
  authority: IAuthorityType;
  noMatch?: React.ReactNode;
}

type IAuthorizedType = React.FunctionComponent<AuthorizedProps> & {
  Secured: typeof Secured;
  check: typeof check;
  AuthorizedRoute: typeof AuthorizedRoute;
};

const Authorized: React.FunctionComponent<AuthorizedProps> = ({
  children,
  authority,
  noMatch = (
    <Snackbar
      place="tc"
      color="warning"
      message="403 WARNING - 您没有权限访问此页面"
      open
      close
    />
  ),
}) => {
  const dispatch = useDispatch();

  const getTokenCall = useCallback(async () => {
    try {
      const token = await getToken();
      try {
        const acessToken = await saveToken(token);
        dispatch(setUserAsync(acessToken));
      } catch (error) {
        // 刷新token
        const newToken = await refreshToken();
        dispatch(setUserAsync(newToken));
      }
    } catch (error) {
      console.error(error);
    }
  }, [dispatch]);

  useEffect(() => {
    let didCancel = false;

    if (!didCancel) {
      getTokenCall();
    }

    return () => {
      didCancel = true;
    };
  }, [dispatch, getTokenCall]);

  const childrenRender: React.ReactNode =
    typeof children === 'undefined' ? null : children;
  const dom = check(authority, childrenRender, noMatch);
  return <>{dom}</>;
};

export default Authorized as IAuthorizedType;
