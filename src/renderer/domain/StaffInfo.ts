import { OnlineStatusKey } from './constant/Staff';
import { CustomerStatus } from './Customer';

export default interface Staff {
  organizationId: number;
  id: number;
  /** use for colleague conversation */
  groupId: number;
  groupName?: string;
  staffGroup: StaffGroup;
  /** type of role */
  role: string;
  shunt: number[];
  prevOnlineStatus?: OnlineStatusKey;
  onlineStatus: OnlineStatusKey;
  maxServiceCount: number;
  currentServiceCount: number;
  priorityOfShunt: string;
  userIdList: number[];
  loginTime: Date;
  /** 是否是机器人 0 机器人， 1人工 */
  staffType: number;
  realName: string;
  username: string;
  nickname: string;
  gender: number | undefined;
  createTime: Date;
  avatar: string | undefined;
  personalizedSignature: string;
  syncState: boolean;
  // just for websocket and upload
  token: string | undefined;
  simultaneousService: number;
  maxTicketPerDay: number | undefined;
  maxTicketAllTime: number | undefined;
  mobilePhone: string;
  enabled: boolean;
  customerList?: CustomerStatus[];
  staff?: Staff;
}

export interface PasswordChanger {
  /**
   * 员工编号 staffId
   */
  id: number;
  oldPassword: string;
  newPassword: string;
}

export interface StaffGroup {
  id: number;
  organizationId: number;
  groupName: string;
  staffList?: Staff[];
}

export interface StaffShunt {
  organizationId: number;
  id: number;
  name: string;
  shuntClassId: number;
  shuntClassName?: string;
  code: string;
  openPush?: string;
  authorizationToken?: string;
  staffList?: Staff[];
}

export interface ShuntClass {
  organizationId: number;
  id: number;
  className: string;
  catalogue: number | undefined;
  children: ShuntClass[] | undefined;
}

export interface StaffConfig {
  id?: number | undefined;
  /** 公司id */
  organizationId?: number | undefined;
  /** 接待组 id */
  shuntId: number | undefined;
  /** 配置优先级 */
  priority: number | undefined;
  staffId: number | undefined;
  staffName?: string;
  staffType?: number;
  enabled?: boolean;
}

export interface StaffConfigData {
  onlineStatus: OnlineStatusKey;
  groupId: number;
}

export function configStatus(
  onlineStatus: OnlineStatusKey,
  groupId: number
): StaffConfigData {
  return {
    onlineStatus,
    groupId,
  };
}
