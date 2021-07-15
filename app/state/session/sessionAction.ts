import { AppThunk, RootState } from 'app/store';
import { of } from 'rxjs';
import { map, filter, tap, catchError } from 'rxjs/operators';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { WebSocketRequest, generateResponse } from 'app/domain/WebSocket';
import { CallBack } from 'app/service/websocket/EventInterface';
import {
  Content,
  Message,
  MessagesMap,
  PhotoContent,
  UpdateMessage,
} from 'app/domain/Message';
import { Conversation } from 'app/domain/Conversation';
import { createSession } from 'app/domain/Session';
import { getCustomerByUserId } from 'app/service/infoService';
import { emitMessage, filterUndefinedWithCb } from 'app/service/socketService';
import { createSelector } from '@reduxjs/toolkit';
import { CreatorType } from 'app/domain/constant/Message';
import slice from './sessionSlice';

const { newConver, newMessage } = slice.actions;
export const { stickyCustomer, tagCustomer, updateCustomer } = slice.actions;

export const getSelectedMessageList = (state: RootState) => {
  const selected = state.chat.selectedSession;
  let messageList: Message[] = [];
  if (selected !== undefined && !state.chat.monitored) {
    const messageListMap = state.session[selected].massageList;
    if (messageListMap !== undefined) {
      messageList = _.values(messageListMap);
    }
  }
  if (selected !== undefined && state.chat.monitored) {
    messageList = _.values(state.chat.monitored.monitoredMessageList[selected]);
  }
  return messageList.sort(
    (a, b) =>
      // 默认 seqId 为最大
      (a.seqId ?? Number.MAX_SAFE_INTEGER) -
      (b.seqId ?? Number.MAX_SAFE_INTEGER)
  );
};

export const getSelectedSession = (state: RootState) => {
  const selected = state.chat.selectedSession;
  if (selected === undefined) return null;
  if (selected !== undefined && state.chat.monitored) {
    return state.chat.monitored.monitoredSession;
  }
  return state.session[selected]?.conversation;
};

export const getSelectedConstomer = (state: RootState) => {
  const selected = state.chat.selectedSession;
  if (state.chat.monitored) return state.chat.monitored.monitoredUser;
  if (selected === undefined) return null;
  return state.session[selected].user;
};

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
        .sort((a, b) => b.lastMessageTime - a.lastMessageTime)
        // 按置顶排序
        .sort((a, b) => {
          let result = 0;
          if (a.sticky) result -= 1;
          if (b.sticky) result += 1;
          return result;
        })
  );

// 分配会话
export const assignmentConver =
  (request: WebSocketRequest<Conversation>, cb: CallBack<string>): AppThunk =>
  async (dispatch) => {
    const conversation = request.body;
    if (conversation !== undefined) {
      // 根据分配的 conversation 获取 user
      const { userId } = conversation;
      const customer = await getCustomerByUserId(userId);
      dispatch(newConver(createSession(conversation, customer)));
      cb(generateResponse(request.header, '"OK"'));
    } else {
      cb(generateResponse(request.header, 'request empty', 400));
    }
  };

/**
 * 发送消息到服务器
 * @param message 消息结构
 * @returns callback
 */
export function sendMessage(message: Message): AppThunk {
  return (dispatch, getState) => {
    // 发送消息到服务器
    message.nickName = getState().staff.nickName;
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
export const setNewMessage =
  (request: WebSocketRequest<UpdateMessage>, cb: CallBack<string>): AppThunk =>
  async (dispatch) => {
    of(request)
      .pipe(
        map((r) => r.body),
        filterUndefinedWithCb(request.header, cb),
        tap(() => {
          cb(generateResponse(request.header, '"OK"'));
        }),
        map((r) => r?.message),
        map((m) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return { [m!.uuid]: m } as MessagesMap;
        })
      )
      .subscribe((end) => {
        dispatch(newMessage(end));
      });
  };

/**
 * 发送文本消息到用户
 * @param to 用户ID
 * @param textContent 消息体
 * @returns
 */
export function sendTextMessage(to: number, textContent: string): AppThunk {
  return (dispatch) => {
    const content: Content = {
      contentType: 'TEXT',
      textContent: {
        text: textContent,
      },
    };
    const message: Message = {
      uuid: uuidv4().substr(0, 8),
      to,
      type: CreatorType.CUSTOMER,
      creatorType: CreatorType.STAFF,
      content,
    };
    dispatch(sendMessage(message));
  };
}

export function sendImageMessage(
  to: number,
  photoContent: PhotoContent
): AppThunk {
  return (dispatch) => {
    const content: Content = {
      contentType: 'IMAGE',
      photoContent,
    };
    const message: Message = {
      uuid: uuidv4().substr(0, 8),
      to,
      type: CreatorType.CUSTOMER,
      creatorType: CreatorType.STAFF,
      content,
    };
    dispatch(sendMessage(message));
  };
}
