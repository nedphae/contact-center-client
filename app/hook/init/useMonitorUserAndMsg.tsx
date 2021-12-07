import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { gql, useLazyQuery } from '@apollo/client';
import { Message } from 'app/domain/Message';
import { getMonitor, setMonitoredMessage } from 'app/state/chat/chatAction';
import { PageResult } from 'app/domain/Page';
import { CONVERSATION_FIELD } from 'app/domain/graphql/Conversation';
import { interval, Subscription } from 'rxjs';
import { MSG_PAGE_QUERY } from 'app/domain/graphql/Message';

const QUERY_MONITOR_MESSAGE = gql`
  ${MSG_PAGE_QUERY}
  query SyncMessageByUser($userId: Long!, $cursor: Long) {
    syncMessageByUser(userId: $userId, cursor: $cursor, end: null) {
      ...pageOnMessagePage
    }
  }
`;

interface Graphql {
  syncMessageByUser: PageResult<Message>;
}

export const QUERY = gql`
  ${CONVERSATION_FIELD}
  query Customer($userId: Long!) {
    getCustomer(userId: $userId) {
      organizationId
      userId: id
      uid
      name
      email
      mobile
      address
      vipLevel
      remarks
      data {
        key
        label
        value
        index
        hidden
        href
      }
    }
    getLastConversation(userId: $userId) {
      ...conversationFields
    }
  }
`;

const useMonitorUserAndMsg = (refreshInterval: number) => {
  const dispatch = useDispatch();
  const monitorSession = useSelector(getMonitor);
  const lastSeqIdRef = useRef<number>();
  const subscription = useRef<Subscription>();
  const [syncMessageByUser, { data, refetch }] = useLazyQuery<Graphql>(
    QUERY_MONITOR_MESSAGE,
    {
      fetchPolicy: 'no-cache',
    }
  );

  const userId = monitorSession?.monitoredUserStatus?.userId;

  useEffect(() => {
    if (userId) {
      syncMessageByUser({
        variables: { userId, cursor: undefined },
      });
    }
  }, [syncMessageByUser, userId]);

  useEffect(() => {
    if (
      data &&
      data.syncMessageByUser &&
      userId &&
      data.syncMessageByUser.content &&
      data.syncMessageByUser.content.length > 0
    ) {
      const messageList = data.syncMessageByUser.content;
      if (lastSeqIdRef.current !== messageList[0]?.seqId) {
        lastSeqIdRef.current = messageList[0]?.seqId;
      }
      const userMessages = { [userId]: messageList };
      dispatch(setMonitoredMessage(userMessages));
    }
  }, [data, dispatch, userId]);

  // 同步消息
  useEffect(() => {
    if (userId && refetch && !subscription.current) {
      subscription.current = interval(refreshInterval).subscribe(() => {
        refetch({
          variables: { userId, cursor: lastSeqIdRef.current },
        });
      });
    }
    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
      lastSeqIdRef.current = undefined;
    };
  }, [refetch, refreshInterval, userId]);
};

export default useMonitorUserAndMsg;
