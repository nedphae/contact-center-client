declare module '*.less';
declare module '*.json';
declare module '*.css';

declare interface Window {
  socketRef: SocketIOClient.Socket | undefined;
  reloadAuthorized: () => void;
  orgId: number | undefined;
}
