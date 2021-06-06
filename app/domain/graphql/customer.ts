import { gql } from '@apollo/client';
import { Customer } from '../Customer';

const CORE_CUSTOMER_FIELDS = gql`
  fragment CustomerFields on Customer {
    organizationId
    userId: id
    uid
    name
    email
    mobile
    vipLevel
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
`;
export const QUERY_CUSTOMER = gql`
  ${CORE_CUSTOMER_FIELDS}
  query Customer($orgId: Int!, $userId: Long!) {
    getCustomer(oid: $orgId, userId: $userId) {
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
