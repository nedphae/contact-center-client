import { AppThunk } from 'app/store';

import { Conversation } from 'app/domain/Conversation';
import { conver } from 'app/domain/Conver';
import { getCuntomerByUserId } from 'app/service/infoService';
import slice from './converSlice';

const { newConver } = slice.actions;
export const { stickyCustomer } = slice.actions;

// 分配会话
export const assignmentConver = (
  conversation: Conversation
): AppThunk => async (dispatch) => {
  // 根据分配的 conversation 获取 user
  const { userId } = conversation;
  const customer = await getCuntomerByUserId(userId);
  dispatch(newConver(conver(conversation, customer)));
};
