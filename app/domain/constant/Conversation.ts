export enum CloseReason {
  /** 客服关闭 */
  STAFF_CLOSE,
  /** 访客离开页面失效关闭 */
  USER_LEFT,
  /** 访客离开超时关闭 */
  USER_TIME_OUT,
  /** 访客申请其他客服关闭 */
  USER_OTHER_STAFF,
  /** 网络差客服掉线关闭 */
  USER_NET_ERROR,
  /** 客服转接关闭 */
  TRANSLATE,
  /** 管理员接管 */
  ADMIN_TAKE_OVER,
  /** 访客主动关闭 */
  USER_CLOSE,
  /** 系统关闭，静默超时关闭 */
  SYS_CLOSE,
  /** 系统关闭，静默转接关闭 */
  SYS_TRAN,
  /** 访客未说话 */
  USER_SILENT,
  /** 访客排队超时清队列 */
  USER_QUEUE_TIMEOUT,
  /** 访客放弃排队 */
  USER_QUEUE_LEFT,
  /** 客服离线清队列 */
  STAFF_OFFLINE,
  /** 机器人转人工 */
  BOT_TO_STAFF,
}

export enum FromType {
  /** web */
  WEB,
  /** ios */
  IOS,
  /** android */
  ANDROID,
  /** 微信 */
  WX,
  /** 微信小程序 */
  WX_MA,
  /** 微博 */
  WB,
  /** 开放接口 */
  OPEN,
}

export enum RelatedType {
  /** 无关联 */
  NO,
  /** 机器人会话转接人工 */
  FROM_BOT,
  /** 历史会话发起 */
  FROM_HISTORY,
  /** 客服间转接 */
  FROM_STAFF,
  /** 被接管 */
  BE_TAKEN_OVER,
}

export enum TransferType {
  /** 主动转人工 */
  INITIATIVE,
  /** 关键词转人工 */
  KEYWORD,
  /** 回复引导转人工 */
  REPLY,
  /** 拦截词转人工 */
  INTERCEPT_WORD,
  /** 连续未知转人工 */
  CONTINUOUS_UNKNOWN,
  /** 差评转人工 */
  NEGATIVE_RATINGS,
  /** 情绪识别转人工 */
  EMOTION_RECOGNITION,
  /** 图片转人工 */
  PIC,
}

export enum ConversationType {
  /** 正常会话 */
  NORMAL,
  /** 离线留言 */
  OFFLINE_COMMENT,
  /** 排队超时 */
  QUEUE_TIMEOUT,
}

export enum SolveStatus {
  /** 未解决 */
  UNSOLVED,
  /** 已解决 */
  SOLVED,
  /** 解决中 */
  SOLVING,
}
