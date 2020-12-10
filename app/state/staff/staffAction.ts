import { AppThunk, RootState } from 'app/store';
// import from userSlice
import { getCurrentStaff } from 'app/service/userService';
import staffSlice from './staffSlice';

const { setStaff } = staffSlice.actions;

// 异步请求
export const setUserAsync = (): AppThunk => async (dispatch) => {
  // dispatch() dispatch 等待动画
  const staff = await getCurrentStaff();
  dispatch(setStaff(staff));
};

export const getStaff = (state: RootState) => state.user;
