/**
 * 获取信息服务
 */
import axios from 'app/utils/request';
import apolloClient from 'app/utils/apolloClient';
import Staff from 'app/domain/StaffInfo';
import { Customer } from 'app/domain/Customer';
import { gql } from '@apollo/client';

export async function getCurrentStaff(): Promise<Staff> {
  const result = await axios.get<Staff>(`/staff/info`);
  return result.data;
}

export async function getCuntomerByUserId(
  orgId: number,
  userId: number
): Promise<Customer> {
  const customer = gql`
    query customer {
      getCustomer(oid: ${orgId}, userId: ${userId}) {
        organizationId
        userId: id
        uid
        name
        email
        mobile
        status {
          fromType
          groupId
          ip
          loginTime
          onlineStatus
          referrer
          robotShuntSwitch
          shuntId
          staffId
          title
          vipLevel
        }
        detailData {
          id
          key
          label
          value
          index
          hidden
          href
        }
      }
    }
  `;
  const result = await apolloClient.query({ query: customer });
  console.info(result);
  return result.data.getCustomer;
}
