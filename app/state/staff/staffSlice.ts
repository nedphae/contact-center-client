import { createSlice } from '@reduxjs/toolkit';
import Staff from 'app/domain/StaffInfo';

const initStaff = {} as Staff;

const staffSlice = createSlice({
  name: 'staff',
  initialState: initStaff,
  reducers: {
    setStaff: (_, action) => action.payload as Staff,
    clear: () => initStaff,
    // 已经在服务器设置了状态
    setOnline: (staff) => {
      staff.syncState = true;
    },
  },
});

export default staffSlice;

export const { reducer } = staffSlice;
