import { gql } from '@apollo/client';
import { BotConfig, KnowledgeBase, Topic, TopicCategory } from '../Bot';
import { SearchHit } from '../Conversation';
import { PageResult } from '../Page';
import getPageQuery from './Page';
import { PageParam, RangeQuery } from './Query';

export const QUERY_BOT_TOPIC = gql`
  query GetAllTopic {
    allTopic {
      id
      knowledgeBaseId
      question
      md5
      answer {
        type
        content
      }
      innerAnswer
      fromType
      type
      refId
      connectIds
      enabled
      effectiveTime
      failureTime
      categoryId
      faqType
    }
  }
`;

export interface AllTopicGraphql {
  allTopic: Topic[];
}

export interface TopicFilterInput {
  time?: boolean;

  // 关键字
  keyword?: string;

  // 问题类型，空就查询全部
  type?: number;

  // 知识库ID
  knowledgeBaseId?: number;

  enabled?: boolean;
  /**
   * 筛选的分类ID
   */
  categoryIds?: number[];

  // 分页参数，先不分页
  page: PageParam;

  // 时间区间
  timeRange?: RangeQuery<number | string>;
}

export const QUERY_BOTS = gql`
  query Bot {
    allBotConfig {
      id
      botId
      knowledgeBaseId
      noAnswerReply
      questionPrecision
      similarQuestionEnable
      similarQuestionNotice
      similarQuestionCount
      hotQuestion
    }
    allKnowledgeBase {
      id
      name
      description
    }
  }
`;

export interface BotGraphql {
  allBotConfig: BotConfig[];
  allKnowledgeBase: KnowledgeBase[];
}

export const MUTATION_TOPIC = gql`
  mutation DeleteTopic($ids: [String!]!) {
    deleteTopicByIds(ids: $ids)
  }
`;

export interface TopicFilterInputGraphql {
  topicFilterInput: TopicFilterInput;
}

const TOPIC_FRAGMENT = gql`
  fragment topicSearchHit on TopicSearchHit {
    content {
      id
      knowledgeBaseId
      question
      md5
      answer {
        type
        content
      }
      innerAnswer
      fromType
      type
      refId
      connectIds
      enabled
      effectiveTime
      failureTime
      categoryId
      faqType
      # 相似问题
      refList {
        id
        knowledgeBaseId
        question
        md5
        innerAnswer
        fromType
        type
        refId
        connectIds
        enabled
        effectiveTime
        failureTime
        categoryId
        faqType
      }
      # 关联问题
      connectList {
        id
        knowledgeBaseId
        question
        md5
        answer {
          type
          content
        }
        innerAnswer
        fromType
        type
        refId
        connectIds
        enabled
        effectiveTime
        failureTime
        categoryId
        faqType
      }
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

export const TOPIC_PAGE_QUERY = getPageQuery(
  'TopicSearchHitPage',
  TOPIC_FRAGMENT,
  'topicSearchHit'
);

export const SEARCH_TOPIC = gql`
  ${TOPIC_PAGE_QUERY}
  query Topic($topicFilterInput: TopicFilterInput!) {
    searchTopic(topicFilter: $topicFilterInput) {
      ...pageOnTopicSearchHitPage
    }
  }
`;

export interface TopicPageGraphql {
  searchTopic: PageResult<SearchHit<Topic>>;
}

export interface TopicByIdsGraphql {
  getTopicByIds: Topic[];
}

export const QUERY_TOPIC_BY_IDS = gql`
  query GetTopicByIds($ids: [String!]!) {
    getTopicByIds(ids: $ids) {
      id
      knowledgeBaseId
      question
      md5
      answer {
        type
        content
      }
      innerAnswer
      fromType
      type
      refId
      connectIds
      enabled
      effectiveTime
      failureTime
      categoryId
      faqType
    }
  }
`;

export const MUTATION_TOPIC_EXPORT = gql`
  mutation ExportTopic($knowledgeBaseId: Long!) {
    exportTopic(knowledgeBaseId: $knowledgeBaseId)
  }
`;

export interface MutationExportKnowledgeBaseGraphql {
  exportTopic: string;
}

export const MUTATION_DELETE_KNOWLEDGE_BASE = gql`
  mutation DeleteKnowledgeBase($ids: [Long!]!) {
    deleteKnowledgeBaseByIds(ids: $ids)
  }
`;

export const QUERY_TOPIC_CATEGORY_BY_KNOWLEDGE_BASE_ID = gql`
  query TopicCategory($knowledgeBaseId: Long!) {
    topicCategoryByKnowledgeBaseId(knowledgeBaseId: $knowledgeBaseId) {
      id
      knowledgeBaseId
      name
      pid
    }
  }
`;

export interface TopicCategoryGraphql {
  topicCategoryByKnowledgeBaseId: TopicCategory[];
}

export const MUTATION_DELETE_TOPIC_CATEGORY = gql`
  mutation DeleteTopicCategory($ids: [Long!]!) {
    deleteTopicCategoryByIds(ids: $ids)
  }
`;

export interface BotMutationGraphql {
  saveBotConfig: BotConfig;
}

export const MUTATION_BOT_CONFIG = gql`
  mutation BotConfig($botConfigInput: BotConfigInput!) {
    saveBotConfig(botConfig: $botConfigInput) {
      id
      botId
      knowledgeBaseId
      noAnswerReply
      questionPrecision
      similarQuestionEnable
      similarQuestionNotice
      similarQuestionCount
      hotQuestion
    }
  }
`;
