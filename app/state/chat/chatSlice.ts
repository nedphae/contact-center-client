import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Chat from 'app/domain/Chat';

const initChat = {} as Chat;

const chatSlice = createSlice({
  name: 'chat',
  initialState: initChat,
  reducers: {
    setSelectedSession: (chat, action: PayloadAction<number>) => {
      chat.selectedSession = action.payload;
    },
  },
});

export default chatSlice;

export const { reducer } = chatSlice;
