import { Conversation } from 'app/domain/Conversation';
import { Customer } from 'app/domain/Customer';
import { Message, MessagesMap } from 'app/domain/Message';
import { ColorLogo } from './constant/Conversation';

export type Tag = 'important' | '' | undefined;

/** 客户ID 对应 */
export interface Session {
  conversation: Conversation;
  user: Customer;
  /** 未读消息 */
  unread: number;
  /** 会话的聊天消息 */
  massageList: MessagesMap;
  lastMessageTime: number;
  lastMessage: Message | undefined;
  hide: boolean;
  /** 会话标识 */
  colorLogo: ColorLogo;
  /** 是否置顶 */
  sticky: boolean;
  /** 客服打的标签 */
  tag: Tag;
  hasMore: boolean;
  isHistoryMessage: boolean;
  animated: boolean;
}

export interface TagParamer {
  userId: number;
  /** 客服打的标签 */
  tag: Tag;
}

export function createSession(
  conversation: Conversation,
  user: Customer
): Session {
  return {
    conversation,
    user,
    unread: 0,
    massageList: {},
    lastMessageTime: conversation.startTime,
    lastMessage: undefined,
    hide: false,
    colorLogo: ColorLogo.NEW,
    sticky: false,
    tag: undefined,
    hasMore: true,
    isHistoryMessage: false,
    animated: false,
  };
}

export interface SessionMap {
  [userId: number]: Session;
}
