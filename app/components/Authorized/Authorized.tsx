/**
 * Authorized 元素权限配置
 * 搭配 JWT 进行 OAuth2 认证
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { history } from 'app/store';
import { getToken, saveToken } from 'app/electron/jwtStorage';
import Snackbar from '../Snackbar/Snackbar';
import check, { IAuthorityType } from './CheckPermissions';

import AuthorizedRoute from './AuthorizedRoute';
import Secured from './Secured';
import { setUserAsync } from 'app/state/staff/staffAction';

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

  useEffect(() => {
    let didCancel = false;

    (async () => {
      try {
        const token = await getToken();
        if (!didCancel) {
          try {
            const acessToken = await saveToken(token);
            dispatch(setUserAsync(acessToken));
          } catch (error) {
            // 刷新token
          }
        }
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      didCancel = true;
    };
  }, [dispatch]);

  const childrenRender: React.ReactNode =
    typeof children === 'undefined' ? null : children;
  const dom = check(authority, childrenRender, noMatch);
  return <>{dom}</>;
};

export default Authorized as IAuthorizedType;
