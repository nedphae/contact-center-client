import { AppThunk, RootState } from 'app/store';

import slice from './chatSlice';

export const { setSelectedSession } = slice.actions;

export const getSelectedSession = (state: RootState) =>
  state.chat.selectedSession;
