import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { gql, useSubscription } from '@apollo/client';
import { Message } from 'app/domain/Message';
import { PageContent } from 'app/domain/Conversation';
import { setMonitoredMessage } from 'app/state/chat/chatAction';

const MONITOR_SUBSCRIPTION = gql`
  subscription monitorMessage($userId: Long, $seconds: Long) {
    monitorMessageByUser(userId: $userId, seconds: $seconds)
  }
`;

interface Graphql {
  monitorMessageByUser: PageContent<Message>;
}

const useMonitorMsg = (userId: number, refreshInterval: number) => {
  const dispatch = useDispatch();
  const { data } = useSubscription<Graphql>(MONITOR_SUBSCRIPTION, {
    variables: { userId, seconds: refreshInterval },
  });

  useEffect(() => {
    if (data !== undefined) {
      const messageList = data.monitorMessageByUser.content;
      const userMessages = { userId: messageList };
      dispatch(setMonitoredMessage(userMessages));
    }
  }, [data, dispatch]);
};

export default useMonitorMsg;
