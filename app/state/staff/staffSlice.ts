import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OnlineStatus } from 'app/domain/constant/Staff';
import Staff from 'app/domain/StaffInfo';

const initStaff = {} as Staff;

const staffSlice = createSlice({
  name: 'staff',
  initialState: initStaff,
  reducers: {
    setStaff: (_, action: PayloadAction<Staff>) => action.payload,
    clear: () => initStaff,
    // 已经在服务器设置了状态
    setOnline: (staff, action?: PayloadAction<OnlineStatus>) => {
      staff.syncState = true;
      if (action && action.payload) {
        staff.prevOnlineStatus = staff.onlineStatus;
        staff.onlineStatus = action.payload;
      } else {
        staff.onlineStatus = staff.prevOnlineStatus ?? OnlineStatus.ONLINE;
        staff.prevOnlineStatus = OnlineStatus.OFFLINE;
      }
    },
    updateOnlineStatus: (staff, action: PayloadAction<OnlineStatus>) => {
      staff.prevOnlineStatus = staff.onlineStatus;
      staff.onlineStatus = action.payload;
    },
  },
});

export default staffSlice;

export const { reducer } = staffSlice;
