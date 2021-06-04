import { gql } from '@apollo/client';

export const QUERY_STAFF_GROUP = gql`
  query StaffGroup {
    staffGroup
  }
`;

export const QUERY_STAFF_SHUNT = gql`
  query StaffShunt {
    staffShunt
  }
`;
