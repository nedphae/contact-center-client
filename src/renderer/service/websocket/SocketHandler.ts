import {
  configStaff,
  updateOnlineStatusBySocket,
} from 'renderer/state/staff/staffAction';
import { WebSocketRequest } from 'renderer/domain/WebSocket';
import { UpdateMessage } from 'renderer/domain/Message';
import { Conversation } from 'renderer/domain/Conversation';
import {
  assignmentConver,
  setNewMessage,
} from 'renderer/state/session/sessionAction';
import { AppDispatch } from 'renderer/store';
import { setSnackbarProp } from 'renderer/state/chat/chatAction';
import { getTokenSource } from 'renderer/electron/jwtStorage';
import EventInterface, { SocketCallBack } from './EventInterface';

export default class SocketHandler implements EventInterface {
  socket: SocketIOClient.Socket;

  dispatch: AppDispatch;

  onReconnect: () => void;

  constructor(
    $socket: SocketIOClient.Socket,
    $dispatch: AppDispatch,
    $onReconnect: () => void
  ) {
    this.socket = $socket;
    this.dispatch = $dispatch;
    this.onReconnect = $onReconnect;
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
    this.socket.on('disconnect', async () => {
      const accessToken = await getTokenSource();
      this.socket.io.opts.query = `token=${accessToken}`;

      this.dispatch(updateOnlineStatusBySocket('OFFLINE'));
      this.dispatch(
        setSnackbarProp({
          open: true,
          message: 'websocket.error',
          severity: 'error',
          autoHideDuration: undefined,
        })
      );
    });
    this.socket.on('reconnect', () => {
      this.onReconnect();
      this.dispatch(
        setSnackbarProp({
          open: true,
          message: 'websocket.success',
          severity: 'success',
          autoHideDuration: 6000,
        })
      );
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
    cb: SocketCallBack<string>
  ) => {
    this.dispatch(setNewMessage(messageRequest, cb));
  };

  onAssignment = (
    conversationRequest: WebSocketRequest<Conversation>,
    cb: SocketCallBack<string>
  ) => {
    this.dispatch(assignmentConver(conversationRequest, cb));
  };
}
