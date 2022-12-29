import { Conversation } from 'renderer/domain/Conversation';
import { Customer } from 'renderer/domain/Customer';
import { Message, MessagesMap } from 'renderer/domain/Message';
import { NumericDictionary } from 'lodash';
import { InteractionLogo } from './constant/Conversation';

export type Tag = 'important' | '' | undefined;

/** 客户ID 对应 */
export interface Session {
  conversation: Conversation;
  user: Customer;
  /** 未读消息 */
  unread: number;
  /** 会话的聊天消息 */
  messageList: MessagesMap;
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
  userTypingText?: string;
  userTypingTime?: number;
  // 如果更新会话后，需要重新同步用户消息
  shouldSync: boolean;
  // 客服草稿
  staffDraft?: string;
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
    messageList: {},
    lastMessageTime: conversation.startTime,
    lastMessage: undefined,
    firstNeedReplyTime: undefined,
    hide: false,
    interactionLogo: InteractionLogo.NEW,
    sticky: false,
    tag: undefined,
    shouldSync: false,
  };
}

export interface OldSessionMap {
  [userId: number]: Session;
}

export type SessionMap = NumericDictionary<Session>;

export interface UserTyping {
  userId: number;
  userTypingText?: string;
}

export interface UpdateConver {
  conversation: Conversation;
  user: Customer;
}

export interface UpdateSync {
  userId: number;
  shouldSync: boolean;
}
