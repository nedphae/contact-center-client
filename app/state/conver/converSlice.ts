import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConverMap, Conver } from 'app/domain/Conver';

const initConver = {} as ConverMap;

const converSlice = createSlice({
  name: 'conversation',
  initialState: initConver,
  reducers: {
    // 设置新会话
    newConver: (converMap, action: PayloadAction<Conver>) => {
      converMap[action.payload.conversation.userId] = action.payload;
    },
    stickyCustomer: (converMap, action: PayloadAction<number>) => {
      // 设置置顶
      const conver = converMap[action.payload];
      conver.sticky = !conver.sticky;
    },
  },
});

export default converSlice;

export const { reducer } = converSlice;
