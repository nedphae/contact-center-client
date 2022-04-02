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

export const QUERY_STAFF = gql`
  query AllStaff {
    allStaff {
      avatar
      enabled
      gender
      id
      maxTicketAllTime
      maxTicketPerDay
      mobilePhone
      nickName
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
  }
`;

export interface StaffGraphql {
  getStaffById: Staff;
}

export const QUERY_STAFF_LIST_BY_IDS = gql`
  query StaffList($staffIds: [Long!]!) {
    getStaffByIds(staffIds: $staffIds) {
      avatar
      enabled
      gender
      id
      maxTicketAllTime
      maxTicketPerDay
      mobilePhone
      nickName
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
  }
`;
export interface StaffListByIds {
  getStaffByIds: Staff[];
}

export const QUERY_STAFF_BY_ID = gql`
  query Staff($staffId: Long!) {
    getStaffById(staffId: $staffId) {
      id
      organizationId
      username
      role
      groupId
      realName
      nickName
      avatar
      simultaneousService
      maxTicketPerDay
      maxTicketAllTime
      staffType
      gender
      mobilePhone
      personalizedSignature
      enabled
    }
  }
`;

export const MUTATION_SHUNT_CLASS = gql`
  mutation saveShuntClass($shuntClass: ShuntClassInput!) {
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
