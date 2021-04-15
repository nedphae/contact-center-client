import { useEffect, useRef } from 'react';
import IO from 'socket.io-client';

import socketHandler from 'app/service/websocket/SocketHandler';
import config from 'app/config/clientConfig';

/**
 * WebSocket Hook, 返回 websocket对象
 * @param jwt
 */
const useWebSocket = (token: string | null) => {
  const socketRef = useRef<SocketIOClient.Socket>();
  useEffect(() => {
    const options: SocketIOClient.ConnectOpts = token
      ? {
          // reconnectionDelay: 1000,
          // 传递 JWT Token
          // 使用 连接参数 可以方便的保存的握手数据中
          // see https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections-using-jwt?newreg=215d38e39d5c4f6e94ba1cb6b89a7388
          query: {
            //   // jwt token
            token,
          },
        }
      : {};

    if (token) {
      socketRef.current = IO(config.web.host, options);
      window.socketRef = socketRef.current;

      socketHandler(socketRef.current);
    } else {
      options.reconnection = false;
    }

    return () => {
      if (socketRef.current !== undefined) {
        socketRef.current.disconnect();
      }
    };
  });

  return [socketRef.current];
};

export default useWebSocket;
