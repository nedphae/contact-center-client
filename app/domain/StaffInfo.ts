export enum OnlineStatus {
  OFFLINE,
  ONLINE,
  BUSY,
  AWAY,
}

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
}

interface StaffGroup {
  id: number;
  groupName: string;
}

export interface StaffConfig {
  /** type of role */
  role: string;
  onlineStatus: OnlineStatus;
}

export function configFromStaff(staff: Staff): StaffConfig {
  return {
    role: staff.role,
    onlineStatus: staff.onlineStatus,
  };
}
