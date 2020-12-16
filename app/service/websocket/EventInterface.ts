/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch } from 'redux';

export default interface EventInterface {
  readonly socket: SocketIOClient.Socket;

  readonly dispatch: Dispatch<any>;

  init(): void;
}
