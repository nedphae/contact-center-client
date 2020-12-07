import { useSelector } from 'react-redux';
import { RootState } from '../../store';

/**
 * 获取登录态
 */
export default function useIsLogin() {
  const isLogin = useSelector(
    (state: RootState) => state.chat.user && state.chat.user._id !== ''
  );
  return isLogin;
}
