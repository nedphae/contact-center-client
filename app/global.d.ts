declare module '*.less';
declare module '*.json';

declare interface Window {
  socketRef: SocketIOClient.Socket;
  reloadAuthorized: () => void;
}
