import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Object } from 'ts-toolbelt';

import { gql, useQuery, useSubscription } from '@apollo/client';
import { Message } from 'app/domain/Message';
import { setMonitoredMessage, setMonitorUser } from 'app/state/chat/chatAction';
import { PageResult } from 'app/domain/Page';
import {
  CORE_CUSTOMER_FIELDS,
  CustomerGraphql,
} from 'app/domain/graphql/Customer';
import {
  ConversationGraphql,
  CONVERSATION_QUERY,
} from 'app/domain/graphql/Conversation';

const MONITOR_SUBSCRIPTION = gql`
  subscription monitorMessage($userId: Long, $seconds: Long) {
    monitorMessageByUser(userId: $userId, seconds: $seconds)
  }
`;

interface Graphql {
  monitorMessageByUser: PageResult<Message>;
}

export const QUERY = gql`
  ${CORE_CUSTOMER_FIELDS}
  ${CONVERSATION_QUERY}
  query Customer($userId: Long!) {
    getCustomer(userId: $userId) {
      ...CustomerFields
    }
    getConversation(userId: $userId) {
      ...ConversationFields
    }
  }
`;

type CustomerAndConversationGraphql = Object.Merge<
  CustomerGraphql,
  ConversationGraphql
>;

const useMonitorUserAndMsg = (userId: number, refreshInterval: number) => {
  const dispatch = useDispatch();
  const { data } = useSubscription<Graphql>(MONITOR_SUBSCRIPTION, {
    variables: { userId, seconds: refreshInterval },
  });
  // 懒加载 用户信息，降低服务器一次性获取的数据量
  const { data: monitoredUserData } = useQuery<CustomerAndConversationGraphql>(
    QUERY,
    {
      variables: { userId },
    }
  );

  useEffect(() => {
    if (data !== undefined) {
      const messageList = data.monitorMessageByUser.content;
      const userMessages = { userId: messageList };
      dispatch(setMonitoredMessage(userMessages));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (monitoredUserData) {
      dispatch(
        setMonitorUser({
          monitoredUser: monitoredUserData.getCustomer,
          monitoredSession: monitoredUserData.getConversation,
        })
      );
    }
  }, [dispatch, monitoredUserData]);
};

export default useMonitorUserAndMsg;
