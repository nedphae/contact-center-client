declare module '*.less';
declare module '*.json';
declare module '*.css';

declare interface Window {
  socketRef: SocketIOClient.Socket;
  reloadAuthorized: () => void;
}
