import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import IO from 'socket.io-client';

import SocketHandler from 'renderer/service/websocket/SocketHandler';
import config from 'renderer/config/clientConfig';
import { getStaffToken } from 'renderer/state/staff/staffAction';

/**
 * WebSocket Hook, 返回 websocket对象
 * @param jwt
 */
const useWebSocket = (onReconnect: () => void) => {
  const dispatch = useDispatch();
  const token = useSelector(getStaffToken);

  useEffect(() => {
    if (token && !window.socketRef) {
      const options = {
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
      const socketHandler = new SocketHandler(
        window.socketRef,
        dispatch,
        onReconnect
      );
      socketHandler.init();
    }
  }, [dispatch, onReconnect, token]);

  useEffect(() => {
    return () => {
      if (window.socketRef !== undefined) {
        window.socketRef.disconnect();
        window.socketRef = undefined;
      }
    };
  }, []);

  // useEffect(() => {
  //   let tempSubscription: Subscription;
  //   if (window.socketRef && token) {
  //     const period = 1000 * 60 * 60;
  //     let newToken = token;
  //     tempSubscription = interval(period).subscribe(() => {
  //       verifyTokenPromise(newToken, period * 1.5)
  //         .catch(() => {
  //           return refreshToken();
  //         })
  //         .then((accessToken) => {
  //           if (accessToken && window.socketRef) {
  //             newToken = accessToken.source;
  //             window.socketRef.io.opts.query = `token=${accessToken.source}`;
  //           }
  //           dispatch(updateToken(newToken));
  //           return undefined;
  //         })
  //         .catch((error) => {
  //           throw error;
  //         });
  //     });
  //   }
  //   return () => {
  //     if (tempSubscription) {
  //       tempSubscription.unsubscribe();
  //     }
  //   };
  // }, [token, dispatch]);

  return [window.socketRef];
};

export default useWebSocket;
