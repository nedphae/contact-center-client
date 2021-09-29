import { gql } from '@apollo/client';

const CORE_QUICK_REPLY_FIELDS = gql`
  fragment quickReplyFields on QuickReply {
    id
    organizationId
    title
    content
    groupId
    personal
  }
`;

const CORE_QUICK_REPLY_DTO_FIELDS = gql`
  ${CORE_QUICK_REPLY_FIELDS}
  fragment quickReplyDtoFields on QuickReplyDto {
    noGroup {
      ...quickReplyFields
    }
    withGroup {
      id
      organizationId
      groupName
      personal
      quickReply {
        ...quickReplyFields
      }
    }
  }
`;
/**
 * 查询全部快捷回复
 */
export const QUERY_QUICK_REPLY = gql`
  ${CORE_QUICK_REPLY_DTO_FIELDS}
  query QuickReply {
    getQuickReply {
      org {
        ...quickReplyDtoFields
      }
      personal {
        ...quickReplyDtoFields
      }
    }
  }
`;

export const MUTATION_QUICK_REPLY = gql`
  mutation QuickReply($quickReplyInput: QuickReplyInput!) {
    addQuickReply(quickReplyInput: $quickReplyInput) {
      id
    }
  }
`;
export const MUTATION_QUICK_REPLY_GROUP = gql`
  mutation QuickReplyGroup($quickReplyGroupInput: QuickReplyGroupInput!) {
    addQuickReplyGroup(quickReplyGroupInput: $quickReplyGroupInput) {
      id
    }
  }
`;

export const MUTATION_DELETE_QUICK_REPLY = gql`
  mutation QuickReply($id: Long!) {
    deleteQuickReply(id: $id)
  }
`;
export const MUTATION_DELETE_QUICK_REPLY_GROUP = gql`
  mutation QuickReplyGroup($id: Long!) {
    deleteQuickReplyGroup(id: $id)
  }
`;
