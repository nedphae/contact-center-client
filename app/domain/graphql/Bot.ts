import { gql } from '@apollo/client';
import { Topic } from '../Bot';

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
