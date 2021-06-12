import { OnlineStatus } from './constant/Staff';

export default interface Staff {
  organizationId: number;
  id: number;
  /** use for colleague conversation */
  groupId: number;
  staffGroup: StaffGroup;
  /** type of role */
  role: string;
  shunt: number[];
  onlineStatus: OnlineStatus;
  maxServiceCount: number;
  currentServiceCount: number;
  userIdList: number[];
  loginTime: Date;
  staffType: number;
  realName: string;
  username: string;
  nickName: string;
  gender: string | undefined;
  createTime: Date;
  headImg: string | undefined;
  personalizedSignature: string;
  syncState: boolean;
  // just for websocket
  token: string | undefined;
  maxTicketPerDay: number;
  maxTicketAllTime: number;
  mobilePhone: string;
  enabled: boolean;
}

export interface StaffGroup {
  id: number;
  organizationId: number;
  groupName: string;
}

export interface StaffShunt {
  organizationId: number;
  id: number;
  name: string;
  shuntClassId: number;
  code: string;
}

export interface StaffConfig {
  onlineStatus: OnlineStatus;
}

export function configStatus(): StaffConfig {
  return {
    onlineStatus: OnlineStatus.ONLINE,
  };
}
