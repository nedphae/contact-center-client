import { Reducer } from 'redux';
import { stringify } from 'querystring';

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  // 角色
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface UserType {
  organizationId: number;
  username: string;
  password: string;
  role: Array<string>;
}
