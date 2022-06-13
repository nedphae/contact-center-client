import { gql } from '@apollo/client';
import { Topic } from '../Bot';
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

export interface TopicGraphql {
  allTopic: Topic[];
}

export interface TopicFilterInput {
  time?: boolean;

  // 关键字
  keyword?: string;

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
