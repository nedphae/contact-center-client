import { WebSocketRequest } from 'renderer/domain/WebSocket';
import { CallBack } from 'renderer/service/websocket/EventInterface';

const withTimeout = (
  onSuccess: { apply: (thisArg: undefined, arg1: unknown[]) => void },
  onTimeout: () => Error,
  timeout: number
) => {
  let called = false;

  const timer = setTimeout(() => {
    if (called) return;
    called = true;
    onSuccess.apply(this, [onTimeout()]);
  }, timeout);

  return (...args: unknown[]) => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess.apply(this, [null, ...args]);
  };
};

export default withTimeout;

/**
 * websocket 回调，用来做 rxjs 的 bindCallback
 * @param e 事件
 * @param r 请求数据
 * @param cb websocket回调
 */
export const socketCallback = <T, R>(
  e: string,
  r: WebSocketRequest<T>,
  cb: CallBack<R>
) => {
  const cbWithTimeout = withTimeout(
    cb,
    () => {
      return new Error('request timeout');
    },
    // 5秒超时
    5000
  );
  window.socketRef?.emit(e, r, cbWithTimeout);
};
