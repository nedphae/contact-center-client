/**
 * 获取信息服务
 */
import axios from 'renderer/utils/request';
import apolloClient from 'renderer/utils/apolloClient';
import Staff from 'renderer/domain/StaffInfo';
import { Customer } from 'renderer/domain/Customer';
import { QUERY_CUSTOMER } from 'renderer/domain/graphql/Customer';

export async function getCurrentStaff(): Promise<Staff> {
  const result = await axios.get<Staff>('/staff/info');
  return result.data;
}

export async function getCustomerByUserId(userId: number): Promise<Customer> {
  const result = await apolloClient.query({
    query: QUERY_CUSTOMER,
    variables: { userId },
    fetchPolicy: 'no-cache',
  });
  return result.data.getCustomer;
}
