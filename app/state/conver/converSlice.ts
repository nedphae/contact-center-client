import { createSlice } from '@reduxjs/toolkit';
import { ConverMap } from 'app/domain/Conver';

const initConver = {} as ConverMap;

const messageSlice = createSlice({
  name: 'conversation',
  initialState: initConver,
  reducers: {
    // 设置新会话
    newConver: (_, action) => {
      // 根据ID设置消息
      return action.payload as ConverMap;
    },
  },
});

export default messageSlice;

export const { reducer } = messageSlice;
