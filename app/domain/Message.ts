import { MessageTypeKey } from './constant/Message';

/**
 * Chat messages are not stored locally, all get from the server
 * Sync messages by redis, Persistence by ElasticSearch
 */
export interface Message extends MessageResponse {
  uuid: string;
  /** Snowflake long */
  conversationId: number;
  /** message from, setting by server */
  from: number | undefined;
  /** message send to */
  to: number | undefined;
  /** Receiver type */
  type: number;
  /** Creator type */
  creatorType: number;
  content: Content;
  nickName: string;
}

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
  /** 文件名称 */
  filename: string;
  /** 文件大小 */
  size: string;
  /** 根据类型显示不同图标 */
  type: string;
  /** 文件 路径 */
  url: string;
}

export interface Content {
  contentType: MessageTypeKey;
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
  seqId: number;
  /** 服务器接受时间 */
  createdAt: Date | undefined;
  /** 是否 发送到服务器 */
  sync: boolean | undefined;
}
