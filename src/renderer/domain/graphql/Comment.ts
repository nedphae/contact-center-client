import { gql } from '@apollo/client';
import { CommentQuery, CommentPojo } from '../Comment';
import { PageResult } from '../Page';
import getPageQuery from './Page';

export type CommentQueryInput = CommentQuery;

const CORE_COMMENT_FIELDS = gql`
  fragment commentFields on CommentView {
    id
    organizationId
    createdAt
    shuntId
    userId
    uid
    name
    mobile
    email
    message
    solved
    solvedWay
    fromPage
    fromIp
    geo
    responsible
    solvedMsg
  }
`;
const PAGE_QUERY = getPageQuery(
  'CommentPage',
  CORE_COMMENT_FIELDS,
  'commentFields'
);

export const QUERY_COMMENT = gql`
  ${PAGE_QUERY}
  query Comment($commentQuery: CommentQueryInput!) {
    findComment(commentQuery: $commentQuery) {
      ...pageOnCommentPage
    }
  }
`;
export const MUTATION_COMMENT = gql`
  ${CORE_COMMENT_FIELDS}
  mutation Comment($commentList: [CommentInput!]!) {
    saveComment(commentList: $commentList) {
      ...commentFields
    }
  }
`;

export const MUTATION_COMMENT_WITH_IM_SMS = gql`
  ${CORE_COMMENT_FIELDS}
  mutation CommentSMS($commentList: [CommentInput!]!) {
    saveCommentWithIMAndSMS(commentList: $commentList) {
      ...commentFields
    }
  }
`;

export interface CommentGraphql {
  findComment: PageResult<CommentPojo>;
}
export interface SaveCommentGraphql {
  saveComment: CommentPojo[];
}
export interface SaveCommentWithIMAndSMSGraphql {
  saveCommentWithIMAndSMS: CommentPojo[];
}
