/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch } from 'redux';

import { WebSocketResponse } from 'app/domain/WebSocket';

export default interface EventInterface {
  readonly socket: SocketIOClient.Socket;

  readonly dispatch: Dispatch<any>;

  // 注册ws事件侦听
  init(): void;
}

export type CallBack<T> = (response: WebSocketResponse<T>) => void;
