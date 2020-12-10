import { createSlice } from '@reduxjs/toolkit';
import Staff from 'app/domain/StaffInfo';

const initStaff = {} as Staff;

const staffSlice = createSlice({
  name: 'staff',
  initialState: initStaff,
  reducers: {
    setStaff: (_, action) => action.payload as Staff,
    clear: () => initStaff,
  },
});

export default staffSlice;

export const { reducer } = staffSlice;
