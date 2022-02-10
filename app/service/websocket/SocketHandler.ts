import { configStaff, updateOnlineStatus } from 'app/state/staff/staffAction';
import { WebSocketRequest } from 'app/domain/WebSocket';
import { UpdateMessage } from 'app/domain/Message';
import { Conversation } from 'app/domain/Conversation';
import {
  assignmentConver,
  setNewMessage,
} from 'app/state/session/sessionAction';
import { OnlineStatus } from 'app/domain/constant/Staff';
import { AppDispatch } from 'app/store';
import EventInterface, { CallBack } from './EventInterface';

export default class SocketHandler implements EventInterface {
  socket: SocketIOClient.Socket;

  dispatch: AppDispatch;

  constructor($socket: SocketIOClient.Socket, $dispatch: AppDispatch) {
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
    // this.socket.connect();
    this.socket.on('disconnect', () => {
      this.dispatch(updateOnlineStatus(OnlineStatus.OFFLINE));
    });
  }

  /**
   * 箭头语法绑定 this
   */
  onConnect = () => {
    /**
     * 发送客服注册信息(在线状态等)
     * 系统初始化信息，个人设置 等
     */
    this.dispatch(configStaff());
  };

  onMessage = (
    messageRequest: WebSocketRequest<UpdateMessage>,
    cb: CallBack<string>
  ) => {
    this.dispatch(setNewMessage(messageRequest, cb));
  };

  onAssignment = (
    conversationRequest: WebSocketRequest<Conversation>,
    cb: CallBack<string>
  ) => {
    this.dispatch(assignmentConver(conversationRequest, cb));
  };
}
