import { RootState } from 'app/store';

import slice from './chatSlice';

export const {
  setSelectedSession,
  setQuickReply,
  setQuickReplySearchText,
  setMonitoredMessage,
  setMonitorSelectedSession,
  setMonitorUser,
} = slice.actions;

export const getSelectedSession = (state: RootState) =>
  state.chat.selectedSession;

export const getMonitorSelectedSession = (state: RootState) =>
  state.chat.monitored && state.chat.selectedSession;

export const getQuickReply = (state: RootState) => state.chat.quickReply;
export const getFilterQuickReply = (state: RootState) =>
  state.chat.filterQuickReply;
