import { Conversation } from 'app/domain/Conversation';
import { Customer } from 'app/domain/Customer';
import { Message, MessagesMap } from 'app/domain/Message';
import { InteractionLogo } from './constant/Conversation';

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
  // 客户需要回复消息的第一条的时间
  firstNeedReplyTime: number | undefined;
  hide: boolean;
  /** 会话标识 */
  interactionLogo: InteractionLogo;
  /** 是否置顶 */
  sticky: boolean;
  /** 客服打的标签 */
  tag: Tag;
  hasMore: boolean;
  userTypingText?: string;
  userTypingTime?: number;
}

export interface TagParamer {
  userId: number;
  /** 客服打的标签 */
  tag: Tag;
}

export interface LogoUser {
  userId: number;
  /** 客服打的标签 */
  interactionLogo: InteractionLogo;
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
    firstNeedReplyTime: undefined,
    hide: false,
    interactionLogo: InteractionLogo.NEW,
    sticky: false,
    tag: undefined,
    hasMore: true,
  };
}

export interface SessionMap {
  [userId: number]: Session;
}

export interface UserTyping {
  userId: number;
  userTypingText?: string;
}
