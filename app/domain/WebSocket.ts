import { v4 as uuidv4 } from 'uuid';

/**
 * websocket 消费格式封装
 */
export type Header = {
  mid: string;
  sid?: string;
};

export type WebSocketRequest<T> = {
  header: Header;
  body: T | undefined;
};
export type WebSocketResponse<T> = {
  header: Header;
  code: number;
  body: T | undefined;
};

export function generateRequest<T>(data: T): WebSocketRequest<T> {
  // 生成消息id
  const header = { mid: uuidv4().substr(0, 8) };
  return { header, body: data };
}
