import _ from 'lodash';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OnlineStatusKey } from 'renderer/domain/constant/Staff';
import Staff from 'renderer/domain/StaffInfo';

const initStaff = {} as Staff;

const staffSlice = createSlice({
  name: 'staff',
  initialState: initStaff,
  reducers: {
    setStaff: (staff, action: PayloadAction<Staff>) =>
      _.defaults(action.payload, staff),
    clear: () => initStaff,
    // 已经在服务器设置了状态
    setOnline: (staff, action?: PayloadAction<OnlineStatusKey>) => {
      staff.syncState = true;
      if (action && action.payload !== undefined) {
        staff.onlineStatus = action.payload;
      } else {
        staff.onlineStatus = 'ONLINE';
      }
      staff.prevOnlineStatus = undefined;
    },
    clearToken: (staff) => {
      staff.token = undefined;
    },
    updateToken: (staff, action?: PayloadAction<string>) => {
      staff.token = action?.payload;
    },
    updateOnlineStatusBySocket: (
      staff,
      action: PayloadAction<OnlineStatusKey>
    ) => {
      staff.prevOnlineStatus = staff.onlineStatus;
      staff.onlineStatus = action.payload;
    },
  },
});

export default staffSlice;

export const { reducer } = staffSlice;
