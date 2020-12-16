declare module '*.less';
declare module '*.json';

declare interface Window {
  Notification: any;
  socketRef: SocketIOClient.Socket;
}
