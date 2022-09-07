import { PageParam, RangeQuery } from './graphql/Query';

export enum CommentSolved {
  // 未解决
  UNSOLVED,
  // 已解决
  SOLVED,
}
export enum CommentSolvedWay {
  // 手机
  MOBILE,
  // 邮件
  EMAIL,
}

export interface CommentPojo {
  organizationId?: number;
  /** 留言时间 */
  createdAt: number;
  /** 留言时间 */
  /** 所属接待组 */
  shuntId: number;
  id: number;
  userId: number;
  uid: string;
  name: string;
  mobile?: string;
  email?: string;
  message: string;
  solved: CommentSolved;
  solvedWay: CommentSolvedWay;
  fromPage?: string;
  fromIp?: string;
  geo?: string;
  // 负责客服
  responsible?: number;
  // 客户端选择的解决方式
  selectedSolvedWay?: number;
  // 解决消息
  solvedMsg?: string;
}

export interface CommentQuery {
  time?: boolean;
  organizationId?: number;
  userId?: number;
  uid?: string;
  // 查询解决状态，nul：全部，0：未解决，1：已解决
  solved?: CommentSolved;
  // 解决方式
  solvedWay?: CommentSolvedWay;
  /**
   * 时间
   */
  timeRange?: RangeQuery<number | string>;
  /**
   * 分页
   */
  page: PageParam;
}
