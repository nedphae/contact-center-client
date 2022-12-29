import {
  CreatorType,
  MessageStatusKey,
  MessageTypeKey,
  SysCode,
} from './constant/Message';

/**
 * 标记为本地消息
 */
export interface LocalMessage {
  localType?: MessageTypeKey;
  status?: MessageStatusKey;
  file?: File;
  fileId?: string;
}

/**
 * Chat messages are not stored locally, all get from the server
 * Sync messages by redis, Persistence by ElasticSearch
 */
export interface Message extends MessageResponse, LocalMessage {
  uuid: string;
  /** Snowflake long */
  conversationId?: number;
  /** message from, setting by server */
  from?: number;
  /** message send to */
  to?: number;
  /** Receiver type */
  type: CreatorType;
  /** Creator type */
  creatorType: CreatorType;
  content: Content;
  nickName?: string;
}

export interface UpdateMessage {
  pts: number;
  message: Message;
  ptsCount: number;
}

export interface TextContent {
  text: string;
}

export interface PhotoContent {
  /** 媒体id */
  mediaId: string;
  /** 图片名称 */
  filename: string;
  /** 图片大小 */
  picSize: number;
  /** 图片类型 */
  type: string;
}

export interface Attachments {
  /** 媒体id */
  mediaId: string;
  /** 文件名称 */
  filename: string;
  /** 文件大小 */
  size: number;
  /** 根据类型显示不同图标 */
  type: string;
}

export interface Content {
  contentType: MessageTypeKey;
  /** sys 服务消息类型 * */
  sysCode?: SysCode;
  /** 服务消息内容， JSON方式 * */
  serviceContent?: string;
  /** 文字 */
  textContent?: TextContent;
  /** 图片 */
  photoContent?: PhotoContent;
  /** 附件 */
  attachments?: Attachments;
}
/** Message 去重 */
export interface MessagesMap {
  [uuid: string]: Message;
}

export interface MessageResponse {
  /** 雪花ID */
  seqId?: number;
  /** 服务器接受时间 */
  createdAt?: number | string | Date;
}
