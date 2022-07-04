import { gql } from '@apollo/client';
import Organization from '../Organization';

export interface OrganizationInput {
  // 企业邮箱
  email?: string;
  // 企业名称
  name?: string;
  // 企业地址
  address?: string;
  // 企业主页
  homepage?: string;
  // 企业详细信息
  detail?: string;
}

export interface OrganizationGraphql {
  getOrganization: Organization;
}

export interface UpdateOrganizationGraphql {
  updateOrganization: Organization;
}

export const QUERY_ORG = gql`
  query Org {
    getOrganization {
      id
      callingCode
      phone
      email
      name
      address
      homepage
      detail
    }
  }
`;

export const MUTATION_ORG = gql`
  mutation Org($organization: OrganizationInput!) {
    updateOrganization(organization: $organization) {
      id
      callingCode
      phone
      email
      name
      address
      homepage
      detail
    }
  }
`;
