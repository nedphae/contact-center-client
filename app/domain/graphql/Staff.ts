import { gql } from '@apollo/client';
import { Object } from 'ts-toolbelt';

import Staff, { ShuntClass, StaffGroup, StaffShunt } from '../StaffInfo';

export interface StaffList {
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
  StaffList,
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
  query Staff {
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
      staffGroupId
      staffType
      username
    }
  }
`;
