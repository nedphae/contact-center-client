type Staff = {
  organizationId: number;
  id: number;
  // 用来获取分组 同事会话;
  staffGroup: StaffGroup;
  // 角色种类
  role: string;
  // 在线状态 0:off, 1:on
  onlineStatus: number;
  // 就绪状态 0: unready, 1: ready
  readyStatus: number;
  // 繁忙状态 0: busy, 1: idle
  busyStatus: number;
  realName: string;
  username: string;
  nickName: string;
  gender: string;
  createTime: Date;
  headImg: string;
  // 个性签名
  personalizedSignature: string;
  // 同步状态
  syncState: boolean;
};

type StaffGroup = {
  id: number;
  groupName: string;
};

export type StaffConfig = {
  // 角色种类
  role: string;
  // 在线状态 0:off, 1:on
  onlineStatus: number;
  // 就绪状态 0: unready, 1: ready
  readyStatus: number;
  // 繁忙状态 0: busy, 1: idle
  busyStatus: number;
};

export function configFromStaff(staff: Staff): StaffConfig {
  return {
    role: staff.role,
    onlineStatus: staff.onlineStatus,
    readyStatus: staff.readyStatus,
    busyStatus: staff.busyStatus,
  };
}

export default Staff;
