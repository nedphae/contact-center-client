import { Conversation } from 'app/domain/Conversation';
import { Customer } from 'app/domain/Customer';
import { MessagesMap } from 'app/domain/Message';

/** 同事会话监控模块 */
interface Group {
  /** 分组名称 */
  name: string;
  /** member */
  member: GroupMember[];
}

interface GroupMember {
  id: number;
  nickName: string;
  realName: string;
}

/** 客户ID 对应 */
export interface Conver {
  conversation: Conversation;
  user: Customer;
  /** 未读消息 */
  unread: number;
  /** 会话的聊天消息 */
  massageList: MessagesMap | undefined;
  lastMessageTime: Date | undefined;
  lastMessage: string | undefined;
  hide: boolean;
  /** 会话标识 */
  color: 'new' | 'waitting' | 'replied';
  /** 是否置顶 */
  sticky: boolean;
  /** 客服打的标签 */
  tag: 'important' | '' | undefined;
}

export function conver(conversation: Conversation, user: Customer): Conver {
  return {
    conversation,
    user,
    unread: 0,
    massageList: undefined,
    lastMessageTime: undefined,
    lastMessage: undefined,
    hide: false,
    color: 'new',
    sticky: false,
    tag: undefined,
  };
}

export interface ConverMap {
  [userId: number]: Conver;
}
