import { Dispatch } from 'redux';
import { configStaff } from 'app/state/staff/staffAction';

export default class SocketHandler {
  private socket: SocketIOClient.Socket;

  private dispatch: Dispatch<any>;

  constructor($socket: SocketIOClient.Socket, $dispatch: Dispatch<any>) {
    this.socket = $socket;
    this.dispatch = $dispatch;
  }

  async onConnect(): Promise<void> {
    /**
     * 发送客服注册信息(在线状态等)
     * 系统初始化信息，个人设置 等
     */
    this.dispatch(configStaff(this.socket));
  }

  onMessage(): void {}
}
