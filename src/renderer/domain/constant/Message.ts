export enum MessageType {
  /** 系统消息 */
  SYS,
  // 需要展示的系统消息，只在本地有效
  SYS_TEXT,
  /** 文本消息 */
  TEXT,
  /** 图片消息 */
  IMAGE,
  /** 语音消息 */
  VOICE,
  /** 文件消息 */
  FILE,
  /** 链接消息 */
  LINK,
  // 富文本消息
  RICH_TEXT,
  /** 自定义消息 */
  CUSTOMER,
}
// enum 作为 js 的 object，typeof 会返回 'object' 定义
export type MessageTypeKey = keyof typeof MessageType;

/**
 * 消息本地状态
 */
export enum MessageStatus {
  /** 正在发送 */
  PENDDING,
  /** 已经发送文件 */
  FILE_SENT,
  /** 消息发送完成 */
  SENT,
  /** 发生错误 */
  ERROR,
}

export type MessageStatusKey = keyof typeof MessageStatus;

/**
 * 参考钉钉设计的创建者类型
 * 不同于钉钉的 普通消息/OA消息 区分
 * 这里区分不同的使用者类型 (客服/客户)
 */
export enum CreatorType {
  /** 系统 */
  SYS,
  /** 工作人员 */
  STAFF,
  /** 客户 */
  CUSTOMER,
  /** 群聊 */
  GROUP,
}

export type SysCode =
  // 用户正在输入信息
  | 'USER_TYPING'
  // 设置消息已读
  | 'READ_HISTORY'
  // 更新列队
  | 'UPDATE_QUEUE'
  // 分配列队
  | 'ASSIGN'
  // 无答案
  | 'NO_ANSWER'
  // 修改在线状态
  | 'ONLINE_STATUS_CHANGED'
  // 会话结束
  | 'CONV_END'
  // 自动回复
  | 'AUTO_REPLY'
  // 管理员插入会话
  | 'STAFF_HELP'
  // 会话转接
  | 'TRANSFER'
  // 会话转接请求
  | 'TRANSFER_REQUEST'
  // 会话转接响应
  | 'TRANSFER_RESPONSE'
  // 更新会话信息
  | 'CONV_UPDATE'
  // 邀请评价
  | 'EVALUATION_INVITED'
  // 撤回消息
  | 'WITHDRAW'
  // GRAPHQL
  | 'GRAPHQL'
  // 自定义 JSON
  | 'CUSTOMER';
