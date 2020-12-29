enum OnlineStatus {
  OFFLINE,
  ONLINE,
  BUSY,
  AWAY,
}

export default interface Staff {
  organizationId: number;
  id: number;
  // 用来获取分组 同事会话;
  staffGroup: StaffGroup;
  // 角色种类
  role: string;
  // 在线状态
  onlineStatus: OnlineStatus;
  realName: string;
  username: string;
  nickName: string;
  gender: string | undefined;
  createTime: Date;
  headImg: string | undefined;
  // 个性签名
  personalizedSignature: string;
  // 同步状态
  syncState: boolean;
}

interface StaffGroup {
  id: number;
  groupName: string;
}

export interface StaffConfig {
  // 角色种类
  role: string;
  // 在线状态
  onlineStatus: OnlineStatus;
}

export function configFromStaff(staff: Staff): StaffConfig {
  return {
    role: staff.role,
    onlineStatus: staff.onlineStatus,
  };
}
