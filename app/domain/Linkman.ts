import { Conversation } from 'app/domain/Conversation';
import { Customer } from 'app/domain/Customer';

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
interface Linkman {
  conversation: Conversation;
  user: Customer;
  // 未读消息
  unread: number;
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

interface LinkmanMap {
  [conversationId: number]: Linkman;
}
