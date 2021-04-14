import { AppThunk, RootState } from 'app/store';
import { of } from 'rxjs';
import { map, filter, tap, catchError } from 'rxjs/operators';
import _ from 'lodash';

import { WebSocketRequest, generateResponse } from 'app/domain/WebSocket';
import { CallBack } from 'app/service/websocket/EventInterface';
import { Message, MessagesMap } from 'app/domain/Message';
import { Conversation } from 'app/domain/Conversation';
import { createSession } from 'app/domain/Session';
import { getCuntomerByUserId } from 'app/service/infoService';
import { emitMessage, filterUndefinedWithCb } from 'app/service/socketService';
import { createSelector } from '@reduxjs/toolkit';
import slice from './sessionSlice';

const { newConver, newMessage } = slice.actions;
export const { stickyCustomer, tagCustomer } = slice.actions;

export const getSelectedMessageList = () =>
  createSelector(
    (state: RootState) => {
      const selected = state.chat.selectedSession;
      return state.session[selected].massageList;
    },
    (messageList) => _.values(messageList).sort((a, b) => b.seqId - a.seqId)
  );

/**
 * 根据条件获取会话列表，并按照最后消息和置顶排序
 * @param hide 是否是关闭的会话
 */
export const getSession = (hide = false) =>
  createSelector(
    (state: RootState) => state.session,
    (session) =>
      _.values(session)
        .filter((it) => it.hide === hide)
        // 按时间降序
        .sort(
          (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
        )
        // 按置顶排序
        .sort((a, b) => {
          let result = 0;
          if (a.sticky) result -= 1;
          if (b.sticky) result += 1;
          return result;
        })
  );

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
    dispatch(newConver(createSession(conversation, customer)));
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
          if (mr !== undefined) {
            message.seqId = mr.seqId;
            message.createdAt = mr.createdAt;
            message.sync = true;
          }
          return message;
        }),
        catchError(() => {
          // 如果有错误，设置消息发送失败，显示重发按钮, 并把消息设置到最后
          message.sync = false;
          message.seqId = Number.MAX_SAFE_INTEGER;
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
