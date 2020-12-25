/**
 * 会话管理
 */
// 会话基础信息
export interface Conversation {
  id: number;
  organizationId: number;
  staffId: number;
  userId: number;
  inQueueTime: number;
  relatedId: number;
  relatedType:
    | 'NO'
    | 'FROM_BOT'
    | 'FROM_HISTORY'
    | 'FROM_STAFF'
    | 'BE_TAKEN_OVER';
  startTime: Date;
  // 来访时间差，单位毫秒
  visitRange: number;
  // 系统 SYS,
  // 工作人员 STAFF,
  // 客户 CUSTOME
  // 群聊 GROUP
  beginner: 0 | 1 | 2 | 3;
}
