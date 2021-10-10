import { Object } from 'ts-toolbelt';
import _ from 'lodash';

import { Conversation, TransferMessageRequest, TransferQuery } from './Conversation';
import { Customer, CustomerStatus } from './Customer';
import { Message, MessagesMap } from './Message';
import Staff from './StaffInfo';
import { Session } from './Session';
import { Color } from '@material-ui/lab/Alert';

export function fromUserMessagesToMap(
  userMessages: UserMessages
): UserMessageMap {
  const pairs = _.toPairs(userMessages).map((pair) => {
    const userId = pair[0];
    const messageList = pair[1];
    return [
      userId,
      _.defaults(
        {},
        ...messageList.map((m) => {
          return { [m.uuid]: m } as MessagesMap;
        })
      ),
    ];
  });
  return _.fromPairs(pairs);
}
export interface UserMessageMap {
  [userId: number]: MessagesMap;
}

export interface UserMessages {
  [userId: number]: Message[];
}

export interface MonitoredLazyData {
  monitoredUser?: Customer;
  monitoredConversation?: Conversation;
}

export interface Monitored {
  // 监控相关
  monitoredStaff: Staff;
  monitoredUserStatus: CustomerStatus;
  monitoredMessageList?: MessagesMap;
  monitoredSession?: Session;
}

export interface SnackbarProp {
  open: boolean;
  loadding?: boolean;
  severity?: Color;
  message?: string;
}

export interface BaseChat {
  selectedSession?: number;
  snackbarProp?: SnackbarProp;
}

export type SetMonitored = Object.Merge<MonitoredLazyData, Monitored>;

/**
 * 一些聊天状态
 */
export default interface Chat extends BaseChat {
  quickReply: QuickReplyAllDto;
  filterQuickReply: QuickReply[];
  searchQuickReply: QuickReply[];
  quickReplySearchText: string;
  monitored: Monitored | undefined;
  transferMessageToSend?: TransferQuery[];
  transferMessageRecive?: TransferMessageRequest[];
}

export interface QuickReplyAllDtoGraphql {
  getQuickReply: QuickReplyAllDto;
}

export interface QuickReplyAllDto {
  org: QuickReplyDto;
  personal: QuickReplyDto;
}

export interface QuickReplyDto {
  withGroup: QuickReplyGroup[] | undefined;
  noGroup: QuickReply[] | undefined;
}

export interface QuickReplyGroup {
  id: number;
  /** 公司id */
  organizationId: number;
  staffId?: number;
  groupName: string;
  personal?: boolean;
  quickReply: QuickReply[] | undefined;
}

export interface QuickReply {
  id: number;
  /** 公司id */
  organizationId: number;
  // 配置的客服 (每个客服可以有多个配置)
  /** @ManyToOne */
  staffId?: number;
  groupId?: number;
  title: string;
  content: string;
  personal?: boolean;
  group: QuickReplyGroup | undefined;
}
