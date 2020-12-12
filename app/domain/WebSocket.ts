/**
 * websocket 消费格式封装
 */
export type Header = {
  mid: string;
  sid: string;
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
