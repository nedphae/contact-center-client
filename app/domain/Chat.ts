import { Conversation } from './Conversation';
import { Customer, CustomerStatus } from './Customer';
import { Message, MessagesMap } from './Message';
import Staff from './StaffInfo';

export interface UserMessageMap {
  [userId: number]: MessagesMap;
}

export interface UserMessages {
  [userId: number]: Message[];
}

export interface MonitoredLazyData {
  monitoredUser?: Customer;
  monitoredSession?: Conversation;
}

export interface Monitored extends MonitoredLazyData {
  selectedSession: number;
  // 监控相关
  isMonitored: boolean;
  monitoredStaff: Staff;
  monitoredUserStatus: CustomerStatus;
  monitoredMessageList: UserMessageMap;
}
/**
 * 一些聊天状态
 */
export default interface Chat extends Monitored {
  quickReply: QuickReplyAllDto;
  filterQuickReply: QuickReply[];
  searchQuickReply: QuickReply[];
  quickReplySearchText: string;
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
  group: QuickReplyGroup | undefined;
}
