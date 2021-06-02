/** 会话管理 */
import {
  CloseReason,
  ConversationType,
  FromType,
  RelatedType,
  SolveStatus,
  TransferType,
} from './constant/Conversation';
import { CreatorType } from './constant/Message';
import { Message } from './Message';

/** 会话信息 */
export interface Conversation {
  id: number;
  organizationId: number;
  /** 接待组id */
  fromShuntId: number;
  fromGroupId: number;
  fromIp: string;
  fromPage: string;
  fromTitle: string;
  /** 来源类型 */
  fromType: FromType;
  inQueueTime: number;
  interaction: number;
  cType: ConversationType;
  staffId: number;
  realName: string;
  nickName: string;
  startTime: Date;
  userId: number;
  userName: string | undefined;
  vipLevel: number;
  /** 来访时间差，单位毫秒 */
  visitRange: number;
  transferType: TransferType;
  humanTransferSessionId: number;
  transferFromStaffName: string | undefined;
  transferFromGroup: string | undefined;
  transferRemarks: string | undefined;
  isStaffInvited: boolean;
  relatedId: number;
  relatedType: RelatedType;
  category: string | undefined;
  categoryDetail: string | undefined;
  closeReason: CloseReason | undefined;
  endTime: Date | undefined;
  evaluate: string | undefined;
  staffFirstReplyTime: Date | undefined;
  firstReplyCost: number;
  stickDuration: number;
  remarks: string | undefined;
  status: SolveStatus | undefined;
  roundNumber: number;
  clientFirstMessageTime: Date | undefined;
  avgRespDuration: number;
  isValid: number;
  staffMessageCount: number;
  userMessageCount: number;
  treatedTime: number;
  isEvaluationInvited: boolean | undefined;
  terminator: CreatorType | string | undefined;
  beginner: CreatorType;
  chatMessages: Message[] | undefined;
}

export interface ContentList<T> {
  index: string;
  id: string;
  score: number;
  sortValues: [];
  content: T;
  highlightFields: [];
  innerHits: Record<string, unknown>;
  nestedMetaData: Record<string, unknown>;
}

export interface Sort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

export interface Pageable {
  sort: Sort;
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

export interface PageContent<T> {
  content: ContentList<T>[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: Sort;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
