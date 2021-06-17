import { RootState } from 'app/store';

import slice from './chatSlice';

export const {
  setSelectedSession,
  setQuickReply,
  setQuickReplySearchText,
  setMonitoredMessage,
} = slice.actions;

export const getSelectedSession = (state: RootState) =>
  state.chat.selectedSession;

export const getQuickReply = (state: RootState) => state.chat.quickReply;
export const getFilterQuickReply = (state: RootState) =>
  state.chat.filterQuickReply;
