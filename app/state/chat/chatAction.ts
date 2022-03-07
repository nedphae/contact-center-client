import { RootState } from 'app/store';

import slice from './chatSlice';

export const {
  setQuickReply,
  setQuickReplySearchText,
  setMonitoredMessage,
  setMonitoredHasMore,
  setMonitorSelectedSession,
  setSelectedSessionNumber,
  setSnackbarProp,
  setTransferMessageRecive,
  setTransferMessageToSend,
  removeTransferMessageToSend,
  removeTransferMessageRecive,
  setPts,
  setPlayNewMessageSound,
  clearPlayNewMessageSound,
} = slice.actions;

export const getSelectedSession = (state: RootState) => {
  const { monitored } = state.chat;
  const { selectedSession } = state.chat;
  if (selectedSession) {
    if (
      monitored &&
      selectedSession === monitored.monitoredSession?.conversation.userId
    ) {
      return monitored.monitoredSession;
    }
    return state.session[selectedSession];
  }
  return undefined;
};

export const getMonitor = (state: RootState) => state.chat.monitored;

export const getQuickReply = (state: RootState) => state.chat.quickReply;
export const getFilterQuickReply = (state: RootState) =>
  state.chat.filterQuickReply;

export const getSearchText = (state: RootState) =>
  state.chat.quickReplySearchText;
export const getSearchQuickReply = (state: RootState) =>
  state.chat.searchQuickReply;

export const getSelectedConv = (state: RootState) =>
  getSelectedSession(state)?.conversation;

export const getSelectedConstomer = (state: RootState) =>
  getSelectedSession(state)?.user;

export const getSnackbarProp = (state: RootState) => state.chat.snackbarProp;

export const getFirstTransferMessageRecive = (state: RootState) =>
  state.chat.transferMessageRecive && state.chat.transferMessageRecive[0];

export const getPlayNewMessageSound = (state: RootState) =>
  state.chat.playNewMessageSound;
