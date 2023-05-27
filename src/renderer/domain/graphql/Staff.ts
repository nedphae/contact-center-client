import { gql } from '@apollo/client';
import { Object } from 'ts-toolbelt';

import Staff, { ShuntClass, StaffGroup, StaffShunt } from '../StaffInfo';

export interface AllStaffList {
  allStaff: Staff[];
}

export interface StaffGroupList {
  allStaffGroup: StaffGroup[];
}

export interface StaffShuntList {
  allStaffShunt: StaffShunt[];
}

export interface StaffShuntClass {
  allShuntClass: ShuntClass[];
}

export type AllShunt = Object.Merge<StaffShuntList, StaffShuntClass>;

export type AllStaffInfo = Object.MergeAll<
  AllStaffList,
  [StaffGroupList, StaffShuntList]
>;

export const QUERY_GROUP = gql`
  query Group {
    allStaffGroup {
      id
      organizationId
      groupName
    }
  }
`;

export const STAFF_FIELD = gql`
  fragment staffFields on Staff {
    avatar
    enabled
    gender
    id
    # maxTicketAllTime
    # maxTicketPerDay
    mobilePhone
    nickname
    organizationId
    password
    personalizedSignature
    realName
    role
    simultaneousService
    groupId
    staffType
    username
  }
`;

export const QUERY_STAFF = gql`
  ${STAFF_FIELD}
  query AllStaff {
    allStaff {
      ...staffFields
    }
  }
`;

export interface StaffGraphql {
  getStaffById: Staff;
}

export const QUERY_STAFF_LIST_BY_IDS = gql`
  ${STAFF_FIELD}
  query StaffList($staffIds: [Long!]!) {
    getStaffByIds(staffIds: $staffIds) {
      ...staffFields
    }
  }
`;
export interface StaffListByIds {
  getStaffByIds: Staff[];
}

export const QUERY_STAFF_BY_ID = gql`
  ${STAFF_FIELD}
  query Staff($staffId: Long!) {
    getStaffById(staffId: $staffId) {
      ...staffFields
    }
  }
`;

export const MUTATION_SHUNT_CLASS = gql`
  mutation SaveShuntClass($shuntClass: ShuntClassInput!) {
    saveShuntClass(shuntClass: $shuntClass) {
      id
      organizationId
      className
      catalogue
    }
  }
`;

export interface SaveShuntClassGraphql {
  saveShuntClass: ShuntClass;
}

export const MUTATION_DELETE_STAFF = gql`
  mutation DeleteStaff($ids: [Long!]!) {
    deleteStaffByIds(ids: $ids)
  }
`;
