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
