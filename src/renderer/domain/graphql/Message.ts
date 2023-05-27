import { gql } from '@apollo/client';
import { Message } from '../Message';
import { PageResult } from '../Page';
import getPageQuery from './Page';

export const MSG_CONTENT_QUERY = gql`
  fragment myMessageContent on Message {
    content {
      contentType
      sysCode
      attachments {
        mediaId
        filename
        size
        type
      }
      photoContent {
        mediaId
        filename
        picSize
        type
      }
      textContent {
        text
      }
    }
    conversationId
    createdAt
    creatorType
    from
    nickname
    organizationId
    seqId
    to
    type
    uuid
  }
`;

export const MSG_PAGE_QUERY = getPageQuery(
  'MessagePage',
  MSG_CONTENT_QUERY,
  'myMessageContent'
);

export const SYNC_MSG_BY_STAFF = gql`
  ${MSG_PAGE_QUERY}
  query SyncMessageByStaff($staffId: Long!, $cursor: Long, $end: Long) {
    syncMessageByStaff(staffId: $staffId, cursor: $cursor, end: $end) {
      ...pageOnMessagePage
    }
  }
`;

export interface SyncMsgByStaffGraphql {
  syncMessageByStaff: PageResult<Message>;
}
