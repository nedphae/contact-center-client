/** 会话管理 */
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloseReasonTypeKey,
  ConversationType,
  FromType,
  RelatedType,
  SolveStatus,
  TransferType,
} from './constant/Conversation';
import { CreatorType } from './constant/Message';
import { UserTrack } from './Customer';
import { Message } from './Message';
import { SessionCategory } from './SessionCategory';

export interface Evaluate {
  evaluationType: number;
  evaluation: number;
  evaluationRemark: string;
  userResolvedStatus: number;
}

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
  nickname: string;
  startTime: number;
  userId: number;
  uid: string;
  userName: string | undefined;
  vipLevel: number;
  /** 来访时间差，单位毫秒 */
  visitRange: number;
  transferType: TransferType;
  humanTransferSessionId: number;
  transferFromStaffName: string | undefined;
  transferFromShunt: string | undefined;
  transferRemarks: string | undefined;
  isStaffInvited: boolean;
  relatedId: number;
  relatedType: RelatedType;
  category: string | undefined;
  categoryDetail: string | undefined;
  closeReason: CloseReasonTypeKey | undefined;
  endTime: number | undefined;
  evaluate: Evaluate | undefined;
  staffFirstReplyTime: Date | undefined;
  firstReplyCost: number;
  stickDuration: number;
  remarks: string | undefined;
  status: SolveStatus | undefined;
  roundNumber: number;
  clientFirstMessageTime: Date | undefined;
  avgRespDuration: number;
  valid: number;
  staffMessageCount: number;
  userMessageCount: number;
  treatedTime: number;
  isEvaluationInvited: boolean | undefined;
  terminator: CreatorType | string | undefined;
  beginner: CreatorType;
  chatMessages: Message[] | undefined;
  region: string | undefined;
  country: string | undefined;
  city: string | undefined;
  userTrackList: UserTrack[] | undefined;
}

export interface SearchHit<T> {
  index: string;
  id: string;
  score: number;
  sortValues: [];
  content: T;
  highlightFields: [];
  innerHits: Record<string, unknown>;
  nestedMetaData: Record<string, unknown>;
}

/**
 * 修改 会话总结
 */
export interface ConversationCategory {
  id: number;
  category?: string;
  categoryDetail?: string;
}

function createDetailByParent(sessionCategory: SessionCategory): string {
  if (sessionCategory.parentCategoryItem) {
    return `${createDetailByParent(sessionCategory.parentCategoryItem)}/${
      sessionCategory.categoryName
    }`;
  }
  return sessionCategory.categoryName ?? '';
}

export function createConversationCategory(
  conversationId: number,
  sessionCategory: SessionCategory
) {
  const conversationCategory: ConversationCategory = {
    id: conversationId,
    category: sessionCategory.categoryName,
    categoryDetail: createDetailByParent(sessionCategory),
  };
  return conversationCategory;
}

export type TransferQueryType = 'STAFF' | 'SHUNT' | 'GROUP';

export interface TransferQuery {
  type: TransferQueryType;
  userId: number;
  shuntId?: number;
  groupId?: number;
  toStaffId?: number;
  // 可以由后台根据调用客服生成
  fromStaffId?: number;
  remarks?: string;
}

export interface ConversationView {
  id?: number;
  /** 公司id */
  organizationId: number;
  /** 客服id */
  staffId?: number;
  userId: number;
  shuntId: number;
  nickname?: string;
  /** 0=机器人会话 1=客服正常会话 */
  interaction?: number;
  /** 会话结束时间 */
  endTime?: number;
  /** 当前排队信息 */
  queue?: number;
  blockOnStaff: number;
}

export interface TransferMessageRequest {
  userId: number;
  fromStaffId: number;
  toStaffId: number;
  remarks: string;
}

export interface TransferMessageResponse {
  userId: number;
  fromStaffId: number;
  toStaffId: number;
  accept: boolean;
  reason?: string;
}

export interface EvalPropType {
  eval_100: string;
  eval_75: string;
  eval_50: string;
  eval_25: string;
  eval_1: string;
}

export function getEvaluation(
  evalMap: EvalPropType,
  evaluation: number
): string | undefined {
  const anyEvalMap = evalMap as any;
  return anyEvalMap[`eval_${evaluation}`];
}

export function useEvalProp(): EvalPropType {
  const { t } = useTranslation();

  const [evalProp, setEvalProp] = useState<EvalPropType>({
    eval_100: 'Very satisfied',
    eval_75: 'Satisfied',
    eval_50: 'Neutral',
    eval_25: 'Unsatisfied',
    eval_1: 'Very Unsatisfied',
  });
  useEffect(() => {
    setEvalProp({
      eval_100: t('Very satisfied'),
      eval_75: t('Satisfied'),
      eval_50: t('Neutral'),
      eval_25: t('Unsatisfied'),
      eval_1: t('Very Unsatisfied'),
    });
  }, [t]);
  return evalProp;
}
