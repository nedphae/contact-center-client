import { AppThunk } from 'app/store';
import { of } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';
import _ from 'lodash';

import { WebSocketRequest } from 'app/domain/WebSocket';
import { CallBack } from 'app/service/websocket/EventInterface';
import { Message, MessagesMap } from 'app/domain/Message';
import { Conversation } from 'app/domain/Conversation';
import { conver } from 'app/domain/Conver';
import { getCuntomerByUserId } from 'app/service/infoService';
import slice from './converSlice';

const { newConver, newMessage } = slice.actions;
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

export const setNewMessage = (
  request: WebSocketRequest<Message>,
  cb: CallBack<string>
): AppThunk => async (dispatch) => {
  of(request)
    .pipe(
      map((r) => r.body),
      filter((b) => b !== undefined),
      tap(() => {
        cb('3');
      }),
      map((m) => {
        return { [m?.uuid]: m } as MessagesMap;
      })
    )
    .subscribe((end) => {
      dispatch(newMessage(end));
    });
};
