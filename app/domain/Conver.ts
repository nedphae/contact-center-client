import { Conversation } from 'app/domain/Conversation';
import { Customer } from 'app/domain/Customer';
import { Message, MessagesMap } from 'app/domain/Message';
import { ColorLogo } from './constant/Conversation';

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
  lastMessageTime: Date;
  lastMessage: Message | undefined;
  hide: boolean;
  /** 会话标识 */
  colorLogo: ColorLogo;
  /** 是否置顶 */
  sticky: boolean;
  /** 客服打的标签 */
  tag: 'important' | '' | undefined;
}

export function getConver(conversation: Conversation, user: Customer): Conver {
  return {
    conversation,
    user,
    unread: 0,
    massageList: undefined,
    lastMessageTime: new Date(),
    lastMessage: undefined,
    hide: false,
    colorLogo: ColorLogo.NEW,
    sticky: false,
    tag: undefined,
  };
}

export interface ConverMap {
  [userId: number]: Conver;
}
