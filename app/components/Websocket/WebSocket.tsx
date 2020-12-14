import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import IO from 'socket.io-client';

import SocketHandler from 'app/service/SocketHandler';
import config from 'app/config/client';

const WebSocket = (token: string) => {
  const socketRef = useRef<SocketIOClient.Socket>();
  const dispatch = useDispatch();
  useEffect(() => {
    const options: SocketIOClient.ConnectOpts = token
      ? {
          // reconnectionDelay: 1000,
          // 传递的参数，TODO 传递 JWT Token
          // 基于 socketio-jwt 包的认证，后期调研
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
    const socketHandler = new SocketHandler(socketRef.current, dispatch);
    /**
     * 清晰管理 websocket 的侦听事件
     * 不同事件由不同的 handler 处理
     */
    socketRef.current.on('connect', socketHandler.onConnect);
    // 接受同步消息
    socketRef.current.on('msg/sync', socketHandler.onMessage);

    return () => {
      if (socketRef.current !== undefined) {
        socketRef.current.disconnect();
      }
    };
  }, [dispatch, token]);
};

export default WebSocket;
