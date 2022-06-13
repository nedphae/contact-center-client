import { WebSocketResponse } from 'renderer/domain/WebSocket';
import { AppDispatch } from 'renderer/store';

export default interface EventInterface {
  readonly socket: SocketIOClient.Socket;

  readonly dispatch: AppDispatch;

  /** 注册ws事件侦听 */
  init(): void;
}

export type CallBack<T> = (response: WebSocketResponse<T>) => void;
