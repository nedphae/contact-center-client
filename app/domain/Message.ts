/**
 * 聊天消息不做本地存储，全部走服务器
 * 同步消息 redis，持久化消息 es
 */
interface TextContent {
  text: string;
}

interface PhotoContent {
  /** 媒体id */
  mediaId: string;
  /** 图片名称 */
  filename: string;
  /** 图片大小 */
  picSize: number;
  /** 图片类型 */
  type: number;
}

interface Attachments {
  /** 媒体id */
  mediaId: string;
  size: string;
  /** 根据类型显示不同图标 */
  type: string;
  /** 文件 路径 */
  url: string;
}

interface Content {
  contentType: number;
  /** 文字 */
  textContent: TextContent | undefined;
  /** 图片 */
  photoContent: PhotoContent | undefined;
  /** 附件 */
  attachments: Attachments | undefined;
}
/** Message 去重 */
export interface MessagesMap {
  [uuid: string]: Message;
}

export interface MessageResponse {
  /** 雪花ID */
  seqId: number | undefined;
  /** 服务器接受时间 */
  createdAt: Date | undefined;
  /** 是否 发送到服务器 */
  sync: boolean | undefined;
}

export interface Message extends MessageResponse {
  uuid: string;
  /** 会话id 十六进制 long */
  conversationId: number;
  /** 消息来源 (服务器设置) */
  from: number | undefined;
  /** 消息送至 */
  to: number | undefined;
  /** 消息类型 接收者类型 */
  type: number;
  /** 创建者类型 */
  creatorType: number;
  /** 内容 */
  content: Content;
  /** 昵称 */
  nickName: string;
}
