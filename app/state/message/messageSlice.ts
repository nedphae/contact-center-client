import { createSlice } from '@reduxjs/toolkit';
import { Message } from 'app/domain/Message';

const initMessage = {} as Message;

const messageSlice = createSlice({
  name: 'message',
  initialState: initMessage,
  reducers: {
    // 设置新消息
    setMessage: (_, action) => {
      // 根据ID设置消息
      return action.payload as Message;
    },
  },
});

export default messageSlice;

export const { reducer } = messageSlice;
