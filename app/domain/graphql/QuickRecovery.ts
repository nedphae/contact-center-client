import { gql } from '@apollo/client';

const CORE_QUICK_REPLY_FIELDS = gql`
  fragment QuickReplyFields on QuickReply {
    id
    organizationId
    title
    content
  }
`;

const CORE_QUICK_REPLY_DTO_FIELDS = gql`
  ${CORE_QUICK_REPLY_FIELDS}
  fragment QuickReplyDtoFields on QuickReplyDto {
    noGroup {
      ...QuickReplyFields
    }
    withGroup {
      id
      organizationId
      groupName
      quickReply {
        ...QuickReplyFields
      }
    }
  }
`;
/**
 * 查询全部快捷回复
 */
const QUERY_QUICK_REPLY = gql`
  ${CORE_QUICK_REPLY_DTO_FIELDS}
  query QuickReply {
    getQuickReply {
      org {
        ...QuickReplyDtoFields
      }
      personal {
        ...QuickReplyDtoFields
      }
    }
  }
`;

export default QUERY_QUICK_REPLY;
