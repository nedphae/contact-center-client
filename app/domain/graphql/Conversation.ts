import { gql } from '@apollo/client';

interface RangeQuery<T> {
  from?: T;
  includeLower?: boolean;
  includeUpper?: boolean;
  to?: T;
}
type Direction = 'ASC' | 'DESC';

export class PageParam {
  page = 0;

  size = 20;

  direction: Direction;

  properties?: string[] = undefined;

  constructor(
    page = 0,
    size = 20,
    direction: Direction = 'DESC',
    properties: string[] | undefined = undefined
  ) {
    this.page = page;
    this.size = size;
    this.direction = direction;
    this.properties = properties;
  }
}

export interface ConversationGraphql {
  searchConv: string;
}

export interface ConversationQueryInput {
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
  timeRange?: RangeQuery<Date>;

  // 总消息条数
  totalMessageCount?: RangeQuery<number>;
}
export const QUERY_CONVERSATION = gql`
  query Conversation($conversationQueryInput: ConversationQueryInput!) {
    searchConv(conversationQuery: $conversationQueryInput)
  }
`;
