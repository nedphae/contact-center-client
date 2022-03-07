import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Fuse from 'fuse.js';
import _ from 'lodash';

import Chat, {
  QuickReply,
  QuickReplyAllDto,
  UserMessages,
  SetMonitored,
  fromUserMessagesToMap,
  SnackbarProp,
} from 'app/domain/Chat';
import { noGroupOptions } from 'app/utils/fuseUtils';
import { createSession } from 'app/domain/Session';
import { TransferMessageRequest, TransferQuery } from 'app/domain/Conversation';

const initChat = {} as Chat;

// move to window
// 使用全局变量
let noGroupFuse: Fuse<QuickReply>;
let noGroupIndex: Fuse.FuseIndex<QuickReply>;

function setNoGroupIndex(datas: QuickReply[]) {
  noGroupIndex = Fuse.createIndex(noGroupOptions.keys, datas);
}

const chatSlice = createSlice({
  name: 'chat',
  initialState: initChat,
  reducers: {
    setPts: (chat, action: PayloadAction<number | undefined>) => {
      chat.pts = action.payload;
    },
    setPlayNewMessageSound: (chat) => {
      // 新消息声音提醒
      chat.playNewMessageSound = true;
    },
    clearPlayNewMessageSound: (chat) => {
      chat.playNewMessageSound = false;
    },
    setTransferMessageRecive: (
      chat,
      action: PayloadAction<TransferMessageRequest>
    ) => {
      const transferMessageReciveList = chat.transferMessageRecive ?? [];
      transferMessageReciveList.push(action.payload);
      chat.transferMessageRecive = transferMessageReciveList;
    },
    removeTransferMessageRecive: (chat, action: PayloadAction<number>) => {
      const { transferMessageRecive } = chat;
      if (transferMessageRecive && transferMessageRecive.length > 0) {
        chat.transferMessageRecive = transferMessageRecive.filter(
          (it) => it.userId !== action.payload
        );
      }
    },
    setTransferMessageToSend: (chat, action: PayloadAction<TransferQuery>) => {
      const transferMessageToSend = chat.transferMessageToSend ?? [];
      transferMessageToSend.push(action.payload);
      chat.transferMessageToSend = transferMessageToSend;
    },
    removeTransferMessageToSend: (chat, action: PayloadAction<number>) => {
      const { transferMessageToSend } = chat;
      if (transferMessageToSend && transferMessageToSend.length > 0) {
        chat.transferMessageToSend = transferMessageToSend.filter(
          (it) => it.userId !== action.payload
        );
      }
    },
    setSnackbarProp: (
      chat,
      action: PayloadAction<SnackbarProp | undefined>
    ) => {
      chat.snackbarProp = action.payload;
    },
    setSelectedSessionNumber: (
      chat,
      action: PayloadAction<number | undefined>
    ) => {
      chat.monitored = undefined;
      chat.selectedSession = action.payload;
    },
    setMonitorSelectedSession: (
      chat,
      action: PayloadAction<SetMonitored | undefined>
    ) => {
      if (action.payload) {
        const newMonitored = _.omit(
          action.payload,
          'monitoredUser',
          'monitoredConversation'
        );
        if (
          chat.monitored?.monitoredUserStatus.userId !==
          newMonitored.monitoredUserStatus.userId
        ) {
          chat.monitored = newMonitored;
          const monitoredLazyData = _.pick(
            action.payload,
            'monitoredUser',
            'monitoredConversation'
          );
          if (chat.monitored) {
            const customer = _.defaults(
              { status: chat.monitored.monitoredUserStatus },
              monitoredLazyData.monitoredUser
            );
            const conversation = monitoredLazyData.monitoredConversation;
            if (conversation) {
              chat.monitored.monitoredSession = createSession(
                conversation,
                customer
              );
            }
            chat.selectedSession = conversation?.userId;
          }
        }
      } else {
        // 如果传递的是空，就情况监控和当前选择会话
        chat.monitored = undefined;
        chat.selectedSession = undefined;
      }
    },
    setQuickReplySearchText: (chat, action: PayloadAction<string>) => {
      chat.quickReplySearchText = action.payload;
      const result: QuickReply[] = [];
      if (chat.quickReplySearchText && chat.quickReplySearchText !== '') {
        const noGroupResult = noGroupFuse.search(action.payload);
        noGroupResult.forEach((r) => result.push(r.item));
      }
      chat.searchQuickReply = result;
    },
    setQuickReply: (chat, action: PayloadAction<QuickReplyAllDto>) => {
      chat.quickReply = action.payload;

      const result: QuickReply[] = [];
      action.payload.org.withGroup?.forEach((g) =>
        g.quickReply?.forEach((q) => {
          result.push(q);
        })
      );
      action.payload.personal.withGroup?.forEach((g) =>
        g.quickReply?.forEach((q) => {
          result.push(q);
        })
      );
      if (chat.quickReply.personal.noGroup) {
        result.push(...chat.quickReply.personal.noGroup);
      }
      if (chat.quickReply.org.noGroup) {
        result.push(...chat.quickReply.org.noGroup);
      }

      chat.filterQuickReply = result;

      setNoGroupIndex(result);
      noGroupFuse = new Fuse(
        chat.filterQuickReply,
        noGroupOptions,
        noGroupIndex
      );
    },
    setMonitoredMessage: (chat, action: PayloadAction<UserMessages>) => {
      const userMessageMap = fromUserMessagesToMap(action.payload);
      const userIds = _.keys(userMessageMap);
      userIds.forEach((userIdStr) => {
        const userId = parseInt(userIdStr, 10);
        const messageMap = userMessageMap[userId];
        if (chat.monitored) {
          chat.monitored.monitoredMessageList = _.defaultsDeep(
            {},
            chat.monitored.monitoredMessageList,
            messageMap
          );
        }
      });
    },
    setMonitoredHasMore: (
      chat,
      action: PayloadAction<{ userId: number; hasMore: boolean }>
    ) => {
      if (
        chat.monitored?.monitoredSession &&
        action.payload.userId === chat.monitored.monitoredUserStatus.userId
      ) {
        chat.monitored.monitoredSession.hasMore = action.payload.hasMore;
      }
    },
  },
});

export default chatSlice;

export const { reducer } = chatSlice;
