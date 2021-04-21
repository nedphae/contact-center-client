import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import IO from 'socket.io-client';

import SocketHandler from 'app/service/websocket/SocketHandler';
import config from 'app/config/clientConfig';
import { getStaffToken } from 'app/state/staff/staffAction';

/**
 * WebSocket Hook, 返回 websocket对象
 * @param jwt
 */
const useWebSocket = () => {
  const socketRef = useRef<SocketIOClient.Socket>();
  const dispatch = useDispatch();
  const token = useSelector(getStaffToken);

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
      socketRef.current = IO(
        config.web.host + config.websocket.namespace,
        options
      );
      window.socketRef = socketRef.current;

      const socketHandler = new SocketHandler(socketRef.current, dispatch);
      socketHandler.init();
    } else {
      options.reconnection = false;
    }

    return () => {
      if (socketRef.current !== undefined) {
        socketRef.current.disconnect();
      }
    };
  }, [dispatch, token]);

  return [socketRef.current];
};

export default useWebSocket;
