import { useEffect, useRef, useState } from 'react';
import IO from 'socket.io-client';

import socketHandler from 'app/service/websocket/SocketHandler';
import config from 'app/config/client';

/**
 * WebSocket Hook, 返回 websocket对象
 * @param jwt
 */
const useWebSocket = (jwt: string) => {
  const socketRef = useRef<SocketIOClient.Socket>();
  const [token, setToken] = useState(jwt);
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
      options.reconnection = true;
    } else {
      options.reconnection = false;
    }

    socketRef.current = IO(config.server, options);
    window.socketRef = socketRef.current;

    socketHandler(socketRef.current);

    return () => {
      if (socketRef.current !== undefined) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  return [socketRef.current, setToken];
};

export default useWebSocket;
