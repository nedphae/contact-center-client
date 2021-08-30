import {
  bindCallback,
  Observable,
  of,
  throwError,
  TimeoutError,
  timer,
} from 'rxjs';
import { filter, mergeMap, retryWhen, delayWhen } from 'rxjs/operators';

import {
  WebSocketResponse,
  WebSocketRequest,
  generateRequest,
  Header,
  generateResponse,
} from 'app/domain/WebSocket';
import { StaffConfigData } from 'app/domain/StaffInfo';
import { Message, MessageResponse } from 'app/domain/Message';
import { socketCallback } from 'app/utils/socketUtils';
import { CallBack } from './websocket/EventInterface';

const filterCode = <T>() =>
  filter((response: WebSocketResponse<T>) => response.code === 200);

export const filterUndefinedWithCb = <T>(
  header: Header,
  cb: CallBack<string>
) =>
  filter((b: T) => {
    const result = b !== undefined && b !== null;
    if (!result) {
      cb(generateResponse(header, 'request empty', 400));
    }
    return result;
  });

/**
 * 发送 websocket 事件，超时抛出异常
 * @param event 事件
 * @param request 请求
 */
export default function fetch<T, R>(
  event: string,
  request: WebSocketRequest<T>
): Observable<WebSocketResponse<R>> {
  const boundEmit = bindCallback(socketCallback);
  return boundEmit<T, R>(event, request).pipe(filterCode());
}

/**
 * 生成 retry pipe
 * @param maxRetryAttempts 最大尝试次数
 * @param scalingDuration 自增重试间隔
 */
const genericRetryStrategy =
  (maxRetryAttempts = 3, scalingDuration = 5000) =>
  <T>(attempts: Observable<T>) => {
    return attempts.pipe(
      // 这里 mergeMap 效果和 delayWhen 一样
      delayWhen((error, i) => {
        const retryAttempt = i + 1;
        // 如果是超时错误且没有达到最大重试次数
        if (retryAttempt < maxRetryAttempts && error instanceof TimeoutError) {
          // 重试的时间间隔不断增长: 1秒、2秒，以此类推
          return timer(retryAttempt * scalingDuration);
        }
        // 不是我们想重试的，就抛出错误
        return throwError(error);
      })
      // finalize(() => console.log('We are done!'))
    );
  };

/**
 * 发送 websocket 事件，自动超时重试
 * @param event 事件
 * @param request 请求
 * @param retry 尝试次数
 */
export function fetchWithRetry<T, R>(
  event: string,
  request: WebSocketRequest<T>,
  retry = 3
): Observable<WebSocketResponse<R>> {
  const boundEmit = bindCallback(socketCallback);

  const eventObservable = of(event).pipe(
    mergeMap((ev) => boundEmit<T, R>(ev, request)),
    retryWhen(genericRetryStrategy(retry))
  );

  return eventObservable.pipe(filterCode());
}

/**
 * 发送聊天信息到服务器
 * @param message 聊天信息
 */
export function emitMessage(
  message: Message
): Observable<WebSocketResponse<MessageResponse>> {
  return fetchWithRetry('msg/send', generateRequest(message));
}

/**
 * 注册客服
 * @param staffConfig staff config data
 */
export function register<T>(
  staffConfig: StaffConfigData
): Observable<WebSocketResponse<T>> {
  return fetch('register', generateRequest(staffConfig));
}
