import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import {
  ApolloQueryResult,
  OperationVariables,
  useQuery,
} from '@apollo/client';

import { QuickReplyAllDtoGraphql } from 'app/domain/Chat';
import { QUERY_QUICK_REPLY } from 'app/domain/graphql/QuickReply';
import { setQuickReply } from 'app/state/chat/chatAction';
import {
  SessionCategoryGraphql,
  QUERY_SESSION_CATEGORY,
} from 'app/domain/graphql/SessionCategory';
import { SessionCategory } from 'app/domain/SessionCategory';
import {
  ConversationStaffIdGraphql,
  QUERY_CONV_BY_STAFFID,
} from 'app/domain/graphql/Conversation';
import { updateConver } from 'app/state/session/sessionAction';

interface Result {
  refetchQuickReply(
    variables?: Partial<OperationVariables> | undefined
  ): Promise<ApolloQueryResult<QuickReplyAllDtoGraphql>>;
  sessionCategoryList?: SessionCategory[];
  sessionCategoryTreeList?: SessionCategory[];
  refetchSessionCategory(
    variables?: Partial<OperationVariables> | undefined
  ): Promise<ApolloQueryResult<SessionCategoryGraphql>>;
  refetchOnlineConv(
    variables?: Partial<OperationVariables> | undefined
  ): Promise<ApolloQueryResult<ConversationStaffIdGraphql>>;
}
/**
 * 用于初始化数据，载入：
 *
 * 配置、快捷回复、咨询类型
 * 等
 *
 * 默认使用 apollo cache，多次载入不会读取远程数据
 */
const useInitData = (): Result => {
  const dispatch = useDispatch();
  const { data, refetch } =
    useQuery<QuickReplyAllDtoGraphql>(QUERY_QUICK_REPLY);

  const {
    data: sessionCategoryGraphqlResult,
    refetch: refetchSessionCategory,
  } = useQuery<SessionCategoryGraphql>(QUERY_SESSION_CATEGORY, {
    variables: { enabled: true },
  });

  const { data: onlineConverList, refetch: refetchOnlineConv } =
    useQuery<ConversationStaffIdGraphql>(QUERY_CONV_BY_STAFFID);

  // 获取客服当前联系的会话，防止刷新了客户端后会话丢失
  useEffect(() => {
    if (data) {
      dispatch(setQuickReply(data.getQuickReply));
    }
    if (onlineConverList && onlineConverList.onlineConversationByStaffId) {
      onlineConverList.onlineConversationByStaffId.forEach((it) => {
        // TODO: 优化为 batch
        dispatch(updateConver(it));
      });
    }
  }, [data, dispatch, onlineConverList]);

  const sessionCategoryTreeList = useMemo(() => {
    // 初始化 咨询类型 treeList
    const sessionCategoryList = _.cloneDeep(
      sessionCategoryGraphqlResult?.getAllSessionCategory ?? []
    );

    if (sessionCategoryList) {
      const sessionCategoryMap = _.groupBy(
        sessionCategoryList,
        'parentCategory'
      );
      const sessionCategoryIdMap = _.groupBy(sessionCategoryList, 'id');
      const tempSessionCategoryTreeLit = sessionCategoryList
        .map((it) => {
          if (it.id) {
            it.children = sessionCategoryMap[it.id];
          }
          if (it.parentCategory) {
            [it.parentCategoryItem] = sessionCategoryIdMap[it.parentCategory];
          }
          return it;
        })
        .filter((it) => !it.parentCategory);

      return tempSessionCategoryTreeLit;
    }
    return undefined;
  }, [sessionCategoryGraphqlResult]);

  return {
    refetchQuickReply: refetch,
    sessionCategoryList: sessionCategoryGraphqlResult?.getAllSessionCategory,
    sessionCategoryTreeList,
    refetchSessionCategory,
    refetchOnlineConv,
  };
};

export default useInitData;
