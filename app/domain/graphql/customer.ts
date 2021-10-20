import { gql } from '@apollo/client';
import { Customer, CustomerTag } from '../Customer';
import { PageParam, RangeQuery } from './Query';

export const CORE_CUSTOMER_FIELDS = gql`
  fragment customerFields on Customer {
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
      ...customerFields
    }
  }
`;
export const MUTATION_CUSTOMER = gql`
  ${CORE_CUSTOMER_FIELDS}
  mutation Customer($customerInput: CustomerInput!) {
    updateCustomer(customer: $customerInput) {
      ...customerFields
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

export const QUERY_CUSTOMER_TAG = gql`
  query CustomerTag {
    getAllCustomerTag {
      id
      name
      color
    }
  }
`;

export interface CustomerTagGraphql {
  getAllCustomerTag: CustomerTag[];
}

export const MUTATION_DELETE_CUSTOMER_TAG = gql`
  mutation DeleteCustomerTag($ids: [Long!]!) {
    deleteTagsByIds(ids: $ids)
  }
`;

export const MUTATION_SAVE_CUSTOMER_TAG = gql`
  mutation SaveCustomerTag($customerTags: [CustomerTagInput!]!) {
    saveCustomerTag(customerTags: $customerTags) {
      id
      name
      color
    }
  }
`;

export interface CustomerTagSaveGraphql {
  saveCustomerTag: CustomerTag[];
}
