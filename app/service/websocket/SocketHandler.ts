/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';

import { configStaff } from 'app/state/staff/staffAction';
import { WebSocketRequest } from 'app/domain/WebSocket';
import { Message } from 'app/domain/Message';
import { Conversation } from 'app/domain/Conversation';
import EventInterface, { CallBack } from './EventInterface';

class SocketHandler implements EventInterface {
  socket: SocketIOClient.Socket;

  dispatch: Dispatch<any>;

  constructor($socket: SocketIOClient.Socket, $dispatch: Dispatch<any>) {
    this.socket = $socket;
    this.dispatch = $dispatch;
  }

  init(): void {
    /**
     * 清晰管理 websocket 的侦听事件
     * 不同事件由不同的 handler 处理
     */
    this.socket.on('connect', this.onConnect);
    // 接受同步消息
    this.socket.on('msg/sync', this.onMessage);
    // 分配客户
    this.socket.on('assign', this.onAssignment);
  }

  async onConnect(): Promise<void> {
    /**
     * 发送客服注册信息(在线状态等)
     * 系统初始化信息，个人设置 等
     */
    this.dispatch(configStaff(this.socket));
  }

  onMessage(messageRequest: WebSocketRequest<Message>, cb: CallBack): void {
    this.dispatch(/** TODO: 处理消息的 action */ messageRequest.body);
  }

  onAssignment(conversationRequest: WebSocketRequest<Conversation>, cb: CallBack): void {
    this.dispatch(/** TODO: 处理消息的 action */ conversationRequest.body);
  }
}

export default (socket: SocketIOClient.Socket) => {
  const socketHandler = new SocketHandler(socket, useDispatch());
  socketHandler.init();
};
