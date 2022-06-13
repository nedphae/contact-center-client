import { gql } from '@apollo/client';
import { Blacklist } from '../Blacklist';
import { CommentQuery } from '../Comment';

export type CommentQueryInput = CommentQuery;

export const CORE_BLACKLIST_FIELDS = gql`
  fragment blacklistFields on Blacklist {
    id
    organizationId
    staffId
    preventStrategy
    preventSource
    effectiveTime
    failureTime
    audited
  }
`;

export const QUERY_BLACKLISTT = gql`
  ${CORE_BLACKLIST_FIELDS}
  query Blacklist($audited: Boolean!) {
    getAllBlacklist(audited: $audited) {
      ...blacklistFields
    }
  }
`;

export const QUERY_BLACKLISTT_BY = gql`
  ${CORE_BLACKLIST_FIELDS}
  query Blacklist($preventStrategy: String!, $preventSource: String!) {
    getBlacklistBy(
      preventStrategy: $preventStrategy
      preventSource: $preventSource
    ) {
      ...blacklistFields
    }
  }
`;

export const MUTATION_SAVE_BLACKLIST = gql`
  ${CORE_BLACKLIST_FIELDS}
  mutation Blacklist($blacklist: [BlacklistInput!]!) {
    saveBlacklist(blacklist: $blacklist) {
      ...blacklistFields
    }
  }
`;

export const MUTATION_DELETE_BLACKLIST = gql`
  mutation Blacklist($blacklist: [BlacklistInput!]!) {
    deleteBlacklist(blacklist: $blacklist)
  }
`;

export interface BlacklistGraphql {
  getAllBlacklist: Blacklist[];
}
export interface BlacklistByGraphql {
  getBlacklistBy?: Blacklist;
}
export interface SaveBlacklistGraphql {
  saveBlacklist: Blacklist[];
}
export interface DeleteBlacklistGraphql {
  deleteBlacklist?: number;
}
