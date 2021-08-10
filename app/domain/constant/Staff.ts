export enum OnlineStatus {
  OFFLINE,
  ONLINE,
  BUSY,
  AWAY,
}

export type OnlineStatusKey = keyof typeof OnlineStatus;

export enum StaffRole {
  /** 管理员 */
  ADMIN,
  /** 客服 */
  STAFF,
  /** 组长 */
  LEADER,
  /** 质检 */
  QA,
}

export type StaffRoleKey = keyof typeof StaffRole;
