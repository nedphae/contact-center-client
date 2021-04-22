import { OnlineStatus } from './constant/Staff';

export default interface Staff {
  organizationId: number;
  id: number;
  /** use for colleague conversation */
  staffGroup: StaffGroup;
  /** type of role */
  role: string;
  onlineStatus: OnlineStatus;
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
}

interface StaffGroup {
  id: number;
  groupName: string;
}

export interface StaffConfig {
  onlineStatus: OnlineStatus;
}

export function configStatus(): StaffConfig {
  return {
    onlineStatus: OnlineStatus.ONLINE,
  };
}
