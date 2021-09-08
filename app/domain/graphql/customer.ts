import { gql } from '@apollo/client';
import { Customer } from '../Customer';
import { PageParam, RangeQuery } from './Query';

export const CORE_CUSTOMER_FIELDS = gql`
  fragment CustomerFields on Customer {
    organizationId
    userId: id
    uid
    name
    email
    mobile
    address
    vipLevel
    remarks
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
    }
    data {
      key
      label
      value
      index
      hidden
      href
    }
  }
`;
export const QUERY_CUSTOMER = gql`
  ${CORE_CUSTOMER_FIELDS}
  query Customer($userId: Long!) {
    getCustomer(userId: $userId) {
      ...CustomerFields
    }
  }
`;
export const MUTATION_CUSTOMER = gql`
  ${CORE_CUSTOMER_FIELDS}
  mutation Customer($customerInput: CustomerInput!) {
    updateCustomer(customer: $customerInput) {
      ...CustomerFields
    }
  }
`;

export interface CustomerGraphql {
  getCustomer: Customer;
}
export interface UpdateCustomerGraphql {
  updateCustomer: Customer;
}

export interface CustomerQueryInput {
  time?: boolean;
  // 关键字
  keyword?: string;

  // 分页参数
  page: PageParam;

  // 时间区间
  timeRange?: RangeQuery<number | string>;
}
