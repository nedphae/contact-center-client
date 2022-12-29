declare module '*.less';
declare module '*.json';
declare module '*.css';

type QuickReply = import('./domain/Chat').QuickReply;
type Fuse<T> = import('fuse.js').default<T>;
type FuseIndex<T> = import('fuse.js').default.FuseIndex<T>;
type Message = import('renderer/domain/Message').Message;

declare interface Window {
  socketRef: SocketIOClient.Socket | undefined;
  reloadAuthorized: () => void;
  orgId: number | undefined;
  noGroupFuse: Fuse<QuickReply>;
  noGroupIndex: FuseIndex<QuickReply>;
  audio: HTMLAudioElement;
  localMessageMap: Map<string | undefined, Message>;
}
