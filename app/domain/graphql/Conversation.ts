import { gql } from '@apollo/client';
import { Conversation, ConversationView, SearchHit } from '../Conversation';
import { PageResult } from '../Page';
import getPageQuery from './Page';
import { PageParam, RangeQuery } from './Query';

export interface ConversationQueryInput {
  time?: boolean;
  // 咨询类型
  categoryList?: string[];

  // 关键字
  keyword?: string;

  // 分页参数
  page: PageParam;

  // 客服组
  groupId?: number[];

  // 责任客服
  staffIdList?: number[];

  // 时间区间
  timeRange?: RangeQuery<number | string>;

  // 总消息条数
  totalMessageCount?: RangeQuery<number>;
  /**
   * 用户 id
   */
  userId?: number;
}

// 监控使用
export const CONVERSATION_QUERY = gql`
  fragment conversationFields on Conversation {
    avgRespDuration
    beginner
    category
    categoryDetail
    clientFirstMessageTime
    closeReason
    convType
    endTime
    evaluate {
      evaluation
      evaluationRemark
      evaluationType
      userResolvedStatus
    }
    firstReplyCost
    fromGroupId
    fromGroupName
    fromIp
    fromPage
    fromShuntId
    fromShuntName
    fromTitle
    fromType
    humanTransferSessionId
    id
    inQueueTime
    interaction
    isEvaluationInvited
    isStaffInvited
    isValid
    nickName
    organizationId
    realName
    relatedId
    relatedType
    remarks
    roundNumber
    staffFirstReplyTime
    staffId
    staffMessageCount
    startTime
    status
    stickDuration
    terminator
    totalMessageCount
    transferFromGroup
    transferFromStaffName
    transferRemarks
    transferType
    treatedTime
    userId
    userMessageCount
    userName
    vipLevel
    visitRange
  }
`;

const CONTENT_QUERY = gql`
  fragment mySearchHitContent on MySearchHit {
    content {
      avgRespDuration
      beginner
      category
      categoryDetail
      chatMessages {
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
        nickName
        organizationId
        seqId
        to
        type
        uuid
      }
      clientFirstMessageTime
      closeReason
      convType
      endTime
      evaluate {
        evaluation
        evaluationRemark
        evaluationType
        userResolvedStatus
      }
      firstReplyCost
      fromGroupId
      fromGroupName
      fromIp
      fromPage
      fromShuntId
      fromShuntName
      fromTitle
      fromType
      humanTransferSessionId
      id
      inQueueTime
      interaction
      isEvaluationInvited
      isStaffInvited
      isValid
      nickName
      organizationId
      realName
      relatedId
      relatedType
      remarks
      roundNumber
      staffFirstReplyTime
      staffId
      staffMessageCount
      startTime
      status
      stickDuration
      terminator
      totalMessageCount
      transferFromGroup
      transferFromStaffName
      transferRemarks
      transferType
      treatedTime
      userId
      userMessageCount
      userName
      vipLevel
      visitRange
    }
    highlightFields
    id
    index
    innerHits
    nestedMetaData
    # score
    sortValues
  }
`;

export const CONV_PAGE_QUERY = getPageQuery(
  'SearchHitPage',
  CONTENT_QUERY,
  'mySearchHitContent'
);

export interface SearchConv {
  searchConv: PageResult<SearchHit<Conversation>>;
}

export const MUTATION_CONVERSATOIN = gql`
  ${CONVERSATION_QUERY}
  mutation Conversation($conversationCategory: ConversationCategoryInput!) {
    updateConversationCategory(conversationCategory: $conversationCategory) {
      ...conversationFields
    }
  }
`;
export interface MutationConversationGraphql {
  updateCategory: Conversation;
}

export const MUTATION_CONV_TRANSFER = gql`
  mutation ConversationView($transferQuery: TransferQueryInput!) {
    transferTo(transferQuery: $transferQuery) {
      id
      organizationId
      staffId
      userId
      shuntId
      nickName
      interaction
      endTime
      queue
      blockOnStaff
    }
  }
`;
export interface MutationTransferToGraphql {
  transferTo: ConversationView;
}

export const QUERY_CONV = gql`
  ${CONVERSATION_QUERY}
  query Conversation($userId: Long!) {
    getLastConversation(userId: $userId) {
      ...conversationFields
    }
  }
`;

export interface ConversationGraphql {
  getLastConversation: Conversation;
}

export const QUERY_CONV_BY_ID = gql`
  ${CONVERSATION_QUERY}
  query Conversation($id: Long!) {
    getConversationById(id: $id) {
      ...conversationFields
    }
  }
`;

export interface ConversationIdGraphql {
  getConversationById: Conversation;
}
