/**
 * 实时统计数据
 */

export interface RealTimeStatistics {
  // 统计时间
  time: number;
  //
  onlineStaffCount?: number;
  busyStaffCount?: number;
  onlineCustomerCount?: number;
  queueCount?: ShuntQueueCount[];
}
export interface ShuntQueueCount {
  id: number;
  name: string;
  count: number;
}

export const defaultRealTimeStatistics: RealTimeStatistics = {
  time: new Date().getTime(),
  onlineStaffCount: 0,
  busyStaffCount: 0,
  onlineCustomerCount: 0,
  queueCount: [],
};
