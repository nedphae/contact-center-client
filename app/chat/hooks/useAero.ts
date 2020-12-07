import { useSelector } from 'react-redux';
import { RootState } from '../../store';

/**
 * 获取毛玻璃状态属性
 */
export default function useAero() {
  const aero = useSelector((state: RootState) => state.chat.status.aero);
  return {
    'data-aero': aero,
  };
}
