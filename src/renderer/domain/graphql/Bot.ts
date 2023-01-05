import { gql } from '@apollo/client';
import { BotConfig, KnowledgeBase, Topic, TopicCategory } from '../Bot';
import { PageParam, RangeQuery } from './Query';

export const QUERY_BOT_TOPIC = gql`
  query Bot {
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

  // 知识库ID
  knowledgeBaseId?: number;

  enabled?: boolean;
  /**
   * 筛选的分类ID
   */
  categoryIds?: number[];

  // 分页参数，先不分页
  page?: PageParam;

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
    allTopicCategory {
      id
      knowledgeBaseId
      name
      pid
    }
  }
`;

export interface BotGraphql {
  allBotConfig: BotConfig[];
  allKnowledgeBase: KnowledgeBase[];
  allTopicCategory: TopicCategory[];
}

export const MUTATION_TOPIC = gql`
  mutation DeleteTopic($ids: [String!]!) {
    deleteTopicByIds(ids: $ids)
  }
`;

export interface TopicFilterInputGraphql {
  topicFilterInput: TopicFilterInput;
}

export const SEARCH_TOPIC = gql`
  query Topic($topicFilterInput: TopicFilterInput!) {
    searchTopic(topicFilter: $topicFilterInput) {
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

export interface TopicGraphql {
  searchTopic: Topic[];
}
