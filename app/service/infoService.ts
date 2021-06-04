/**
 * 获取信息服务
 */
import axios from 'app/utils/request';
import apolloClient from 'app/utils/apolloClient';
import Staff from 'app/domain/StaffInfo';
import { Customer } from 'app/domain/Customer';
import { QUERY_CUSTOMER } from 'app/domain/graphql/Customer';

export async function getCurrentStaff(): Promise<Staff> {
  const result = await axios.get<Staff>(`/staff/info`);
  return result.data;
}

export async function getCustomerByUserId(
  orgId: number,
  userId: number
): Promise<Customer> {
  const result = await apolloClient.query({
    query: QUERY_CUSTOMER,
    variables: { orgId, userId },
  });
  return result.data.getCustomer;
}
