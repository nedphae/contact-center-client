/**
 * 获取信息服务
 */
import axios from 'app/utils/request';
import Staff from 'app/domain/StaffInfo';
import { Customer } from 'app/domain/Customer';

export async function getCurrentStaff(): Promise<Staff> {
  const result = await axios.get<Staff>(`/staff/info`);
  return result.data;
}

export async function getCuntomerByUserId(userId: number): Promise<Customer> {
  const result = await axios.get<Customer>(`/status/customer/${userId}`);
  return result.data;
}
