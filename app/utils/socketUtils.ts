import { WebSocketRequest } from 'app/domain/WebSocket';
import { CallBack } from 'app/service/websocket/EventInterface';

const withTimeout = (
  onSuccess: { apply: (thisArg: undefined, arg1: unknown[]) => void },
  onTimeout: () => void,
  timeout: number
) => {
  let called = false;

  const timer = setTimeout(() => {
    if (called) return;
    called = true;
    onTimeout();
  }, timeout);

  return (...args: unknown[]) => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess.apply(this, args);
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
      throw new Error('request timeout');
    },
    // 15秒超时
    15000
  );
  window.socketRef?.emit(e, r, cbWithTimeout);
};
