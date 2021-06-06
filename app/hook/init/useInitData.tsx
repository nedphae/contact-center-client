import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  ApolloQueryResult,
  OperationVariables,
  useQuery,
} from '@apollo/client';

import { QuickReplyAllDtoGraphql } from 'app/domain/Chat';
import { QUERY_QUICK_REPLY } from 'app/domain/graphql/QuickReply';
import { setQuickReply } from 'app/state/chat/chatAction';

/**
 * 用于初始化数据，载入配置，快捷回复，等
 */
const useInitData = (): [
  (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<QuickReplyAllDtoGraphql>>
] => {
  const dispatch = useDispatch();
  const { data, refetch } = useQuery<QuickReplyAllDtoGraphql>(
    QUERY_QUICK_REPLY
  );

  useEffect(() => {
    if (data !== undefined) {
      dispatch(setQuickReply(data.getQuickReply));
    }
  }, [data, dispatch]);

  return [refetch];
};

export default useInitData;
