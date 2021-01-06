import { AppThunk } from 'app/store';
import { of } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';

import { WebSocketRequest, generateOKResponse } from 'app/domain/WebSocket';
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
  request: WebSocketRequest<Conversation>,
  cb: CallBack<string>
): AppThunk => async (dispatch) => {
  const conversation = request.body;
  if (conversation !== undefined) {
    // 根据分配的 conversation 获取 user
    const { userId } = conversation;
    const customer = await getCuntomerByUserId(userId);
    dispatch(newConver(conver(conversation, customer)));
    cb(generateOKResponse(request.header, 'ok'));
  } else {
    cb(generateOKResponse(request.header, 'ok', 400));
  }
};

export function sendMessage(message: Message): AppThunk {
  return (dispatch) => {
    const messagesMap = { [message.uuid]: message } as MessagesMap;
    dispatch(newMessage(messagesMap));
  };
}

export const setNewMessage = (
  request: WebSocketRequest<Message>,
  cb: CallBack<string>
): AppThunk => async (dispatch) => {
  of(request)
    .pipe(
      map((r) => r.body),
      filter((b) => {
        const result = b !== undefined;
        if (!result) {
          cb(generateOKResponse(request.header, 'ok', 400));
        }
        return result;
      }),
      tap(() => {
        cb(generateOKResponse(request.header, 'ok'));
      }),
      map((m) => {
        return { [m!.uuid]: m } as MessagesMap;
      })
    )
    .subscribe((end) => {
      dispatch(newMessage(end));
    });
};
