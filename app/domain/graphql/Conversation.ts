import { gql } from '@apollo/client';
import { Conversation, SearchHit } from '../Conversation';
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
  staffGroupId?: number[];

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

export interface ConversationGraphql {
  getConversation: Conversation;
}

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
