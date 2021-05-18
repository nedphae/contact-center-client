import { gql } from '@apollo/client';

const CORE_CUSTOMER_FIELDS = gql`
  fragment CustomerFields on Customer {
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
  mutation Customer($customer: CustomerInput!) {
    updateCustomer(customer: $customer) {
      ...CustomerFields
    }
  }
`;
