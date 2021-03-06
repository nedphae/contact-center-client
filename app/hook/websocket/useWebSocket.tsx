import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { interval } from 'rxjs';

import IO from 'socket.io-client';

import SocketHandler from 'app/service/websocket/SocketHandler';
import config from 'app/config/clientConfig';
import { getStaffToken } from 'app/state/staff/staffAction';
import { getAccessToken } from 'app/electron/jwtStorage';
import { verifyTokenPromise } from 'app/utils/jwtUtils';

/**
 * WebSocket Hook, 返回 websocket对象
 * @param jwt
 */
const useWebSocket = () => {
  const dispatch = useDispatch();
  const token = useSelector(getStaffToken);

  useEffect(() => {
    if (token && !window.socketRef) {
      const options: SocketIOClient.ConnectOpts = {
        // reconnectionDelay: 1000,
        // 传递 JWT Token
        // 使用 连接参数 可以方便的保存的握手数据中
        // see https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections-using-jwt?newreg=215d38e39d5c4f6e94ba1cb6b89a7388
        query: {
          //  jwt token
          token,
        },
        transports: ['websocket'],
      };

      window.socketRef = IO(
        config.web.host + config.websocket.namespace,
        options
      );
      const socketHandler = new SocketHandler(window.socketRef, dispatch);
      socketHandler.init();
    }
  }, [dispatch, token]);

  useEffect(() => {
    return () => {
      if (window.socketRef !== undefined) {
        window.socketRef.disconnect();
        window.socketRef = undefined;
      }
    };
  }, []);

  useEffect(() => {
    if (window.socketRef && token) {
      const period = 1000 * 60 * 10;
      interval(period).subscribe(async () => {
        // 每10分钟更新token
        try {
          verifyTokenPromise(token, period * 2);
        } catch {
          const accessToken = await getAccessToken();
          if (accessToken && window.socketRef) {
            window.socketRef.io.opts.query = `token=${accessToken.source}`;
          }
        }
      });
    }
  }, [token]);

  return [window.socketRef];
};

export default useWebSocket;
