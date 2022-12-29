/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { of } from 'rxjs';
import { map, switchMap, filter, defaultIfEmpty } from 'rxjs/operators';
import _ from 'lodash';

import {
  SessionMap,
  Session,
  TagParamer,
  LogoUser,
  UserTyping,
  UpdateConver,
  UpdateSync,
} from 'renderer/domain/Session';
import { MessagesMap } from 'renderer/domain/Message';
import { Customer, CustomerStatus } from 'renderer/domain/Customer';
import { fromUserMessagesToMap, UserMessages } from 'renderer/domain/Chat';
import { CreatorType } from 'renderer/domain/constant/Message';
import { Conversation } from 'renderer/domain/Conversation';

const initConver = {} as SessionMap;

const converSlice = createSlice({
  name: 'conversation',
  initialState: initConver,
  // createReducer 接收一个代理状态，该状态将所有突变转换为等效的复制操作。
  reducers: {
    // 设置新会话
    newConver: (converMap, action: PayloadAction<Session>) => {
      if (action.payload.user.userId) {
        converMap[action.payload.conversation.userId] = action.payload;
      }
    },
    // 更新会话和用户信息
    updateConverAndCustomer: (
      converMap,
      action: PayloadAction<UpdateConver>
    ) => {
      const { userId } = action.payload.conversation;
      if (userId && converMap[userId]) {
        converMap[userId].conversation = action.payload.conversation;
        converMap[userId].user = action.payload.user;
      }
    },
    // 更新会话信息
    updateConver: (converMap, action: PayloadAction<Conversation>) => {
      const { userId } = action.payload;
      if (userId && converMap[userId]) {
        converMap[userId].conversation = action.payload;
      }
    },
    updateSync: (converMap, action: PayloadAction<UpdateSync>) => {
      const { userId } = action.payload;
      if (userId && converMap[userId]) {
        // 更新完会话，需要同步一下用户消息，防止未获取到转接回来的用户新消息
        converMap[userId].shouldSync = action.payload.shouldSync;
      }
    },
    unhideSession: (converMap, action: PayloadAction<number | undefined>) => {
      if (action.payload) {
        const conver = converMap[action.payload];
        if (conver && conver.hide) {
          conver.hide = false;
        }
      }
    },
    clearMessgeBadge: (
      converMap,
      action: PayloadAction<number | undefined>
    ) => {
      if (action.payload) {
        const conver = converMap[action.payload];
        if (conver) {
          conver.unread = 0;
        }
      }
    },
    addNewMessgeBadge: (
      converMap,
      action: PayloadAction<number | undefined>
    ) => {
      if (action.payload) {
        const conver = converMap[action.payload];
        if (conver) {
          conver.unread += 1;
        }
      }
    },
    hideSelectedSession: (converMap, action: PayloadAction<number>) => {
      const conver = converMap[action.payload];
      conver.hide = true;
    },
    updateCustomer: (converMap, action: PayloadAction<Customer>) => {
      if (action.payload.userId && converMap[action.payload.userId]) {
        converMap[action.payload.userId].user = action.payload;
      }
    },
    updateCustomerStatus: (
      converMap,
      action: PayloadAction<CustomerStatus>
    ) => {
      if (action.payload.userId && converMap[action.payload.userId]) {
        converMap[action.payload.userId].user.status = action.payload;
      }
    },
    stickyCustomer: (converMap, action: PayloadAction<number>) => {
      // 设置置顶
      const conver = converMap[action.payload];
      conver.sticky = !conver.sticky;
    },
    tagCustomer: (converMap, action: PayloadAction<TagParamer>) => {
      // 设置标签
      const conver = converMap[action.payload.userId];
      conver.tag = action.payload.tag;
    },
    setInteractionLogo: (converMap, action: PayloadAction<LogoUser>) => {
      // 设置会话标识
      const conver = converMap[action.payload.userId];
      if (conver) {
        conver.interactionLogo = action.payload.interactionLogo;
      }
    },
    addHistoryMessage: (converMap, action: PayloadAction<UserMessages>) => {
      // TODO 判断是否是 监控
      const userMessageMap = fromUserMessagesToMap(action.payload);
      const userIds = _.keys(userMessageMap);
      userIds.forEach((userIdStr) => {
        const userId = parseInt(userIdStr, 10);
        const messageMap = userMessageMap[userId];
        const conver = converMap[userId];
        conver.messageList = _.defaults(conver.messageList, messageMap);
      });
    },
    newMessage: (converMap, action: PayloadAction<MessagesMap>) => {
      // 设置新消息
      of(action.payload)
        .pipe(
          switchMap((m) => {
            const msg = _.valuesIn(m)[0];
            const { from, to } = msg;
            return of(from).pipe(
              filter((f) => f !== undefined && f !== null),
              map((f) => converMap[f!]),
              filter((f) => f !== undefined && f !== null),
              defaultIfEmpty<Session | undefined, Session | undefined>(
                to ? converMap[to] : undefined
              ),
              filter(() => msg.creatorType !== CreatorType.SYS),
              map((c) => {
                if (c) {
                  c.lastMessageTime =
                    (msg.createdAt as number | null) ?? c.lastMessageTime;

                  [c.lastMessage] = _.valuesIn(m);
                  // 消息如果存在了就不在设置 change from _.merge
                  c.messageList = _.assign(c.messageList, m);

                  if (msg.creatorType === CreatorType.CUSTOMER) {
                    if (c.firstNeedReplyTime === undefined) {
                      c.firstNeedReplyTime = c.lastMessageTime;
                    }
                  } else if (!msg.content.sysCode) {
                    c.firstNeedReplyTime = undefined;
                  }
                }
              })
            );
          })
        )
        .subscribe();
    },
    setTyping: (converMap, action: PayloadAction<UserTyping>) => {
      const conver = converMap[action.payload.userId];
      conver.userTypingText = action.payload.userTypingText;
      conver.userTypingTime =
        conver.userTypingText === undefined ? undefined : new Date().getTime();
    },
    setStaffDraft: (
      converMap,
      action: PayloadAction<{ userId: number; staffDraft: string }>
    ) => {
      const conver = converMap[action.payload.userId];
      conver.staffDraft = action.payload.staffDraft;
    },
    removeMessageByUUID: (
      converMap,
      action: PayloadAction<{ userId: number; uuid: string }>
    ) => {
      const cover = converMap[action.payload.userId];
      delete cover.messageList[action.payload.uuid];
    },
  },
});

export default converSlice;

export const { reducer } = converSlice;
