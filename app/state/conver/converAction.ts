import { AppThunk } from 'app/store';
import { of } from 'rxjs';
import { map, filter, tap, catchError } from 'rxjs/operators';

import { WebSocketRequest, generateResponse } from 'app/domain/WebSocket';
import { CallBack } from 'app/service/websocket/EventInterface';
import { Message, MessagesMap } from 'app/domain/Message';
import { Conversation } from 'app/domain/Conversation';
import { conver } from 'app/domain/Conver';
import { getCuntomerByUserId } from 'app/service/infoService';
import { emitMessage, filterUndefinedWithCb } from 'app/service/socketService';
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
    cb(generateResponse(request.header, 'ok'));
  } else {
    cb(generateResponse(request.header, 'request empty', 400));
  }
};

export function sendMessage(message: Message): AppThunk {
  return (dispatch) => {
    // 发送消息到服务器
    emitMessage(message)
      .pipe(
        map((r) => r.body),
        filter((b) => b !== undefined),
        map((mr) => {
          // 设置服务器返回的消息序列号和消息时间
          message.seqId = mr?.seqId;
          message.createdAt = mr?.createdAt;
          message.sync = true;
          return message;
        }),
        catchError(() => {
          // 如果有错误，设置消息发送失败，显示重发按钮
          message.sync = false;
          return of(message);
        }),
        map((m) => {
          return { [m.uuid]: m } as MessagesMap;
        })
      )
      .subscribe((messagesMap) => {
        // 显示消息
        dispatch(newMessage(messagesMap));
      });
  };
}

/**
 * 获取设置服务器发送的消息
 * @param request 消息请求
 * @param cb 回调
 */
export const setNewMessage = (
  request: WebSocketRequest<Message>,
  cb: CallBack<string>
): AppThunk => async (dispatch) => {
  of(request)
    .pipe(
      map((r) => r.body),
      filterUndefinedWithCb(request.header, cb),
      tap(() => {
        cb(generateResponse(request.header, 'ok'));
      }),
      map((m) => {
        return { [m!.uuid]: m } as MessagesMap;
      })
    )
    .subscribe((end) => {
      dispatch(newMessage(end));
    });
};
