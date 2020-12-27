import { Conversation } from 'app/domain/Conversation';
import { Customer } from 'app/domain/Customer';
import { MessagesMap } from 'app/domain/Message';

// 同事会话监控模块
interface Group {
  // 分组名称
  name: string;
  // member
  member: GroupMember[];
}

interface GroupMember {
  id: number;
  nickName: string;
  realName: string;
}

// 客户ID 对应
interface Conver {
  conversation: Conversation;
  user: Customer;
  // 未读消息
  unread: number;
  // 会话的聊天消息
  massageList: MessagesMap;
  lastMessageTime: Date;
  lastMessage: string;
  hide: boolean;
  // 会话标识
  color: 'new' | 'waitting' | 'replied';
  // 客户在线状态
  onlineStatue: 'online' | 'offline' | 'leave';
  // 是否置顶
  sticky: boolean;
  // 客服打的标签
  tag: 'important' | '' | undefined;
}

export interface ConverMap {
  [userId: number]: Conver;
}
