/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { of } from 'rxjs';
import { map, switchMap, filter, defaultIfEmpty } from 'rxjs/operators';
import _ from 'lodash';

import { SessionMap, Session, TagParamer, LogoUser } from 'app/domain/Session';
import { MessagesMap } from 'app/domain/Message';
import { Customer, CustomerStatus } from 'app/domain/Customer';
import { fromUserMessagesToMap, UserMessages } from 'app/domain/Chat';
import { CreatorType } from 'app/domain/constant/Message';

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
      if (action.payload.userId) {
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
        conver.massageList = _.defaults(conver.massageList, messageMap);
      });
    },
    setHasMore: (
      converMap,
      action: PayloadAction<{ userId: number; hasMore: boolean }>
    ) => {
      const conver = converMap[action.payload.userId];
      conver.hasMore = action.payload.hasMore;
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
              map((c) => {
                if (c) {
                  c.lastMessageTime =
                    (msg.createdAt as number | null) ?? c.lastMessageTime;

                  [c.lastMessage] = _.valuesIn(m);
                  // 消息如果存在了就不在设置 change from _.merge
                  c.massageList = _.defaults(c.massageList, m);

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
  },
});

export default converSlice;

export const { reducer } = converSlice;
