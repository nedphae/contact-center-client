import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLazyQuery } from '@apollo/client';
import { getMonitor, setMonitoredMessage } from 'renderer/state/chat/chatAction';
import { interval, Subscription } from 'rxjs';
import {
  SyncMessageByUserGraphql,
  QUERY_SYNC_USER_MESSAGE,
} from 'renderer/domain/graphql/Monitor';

const useMonitorUserAndMsg = (refreshInterval: number) => {
  const dispatch = useDispatch();
  const monitorSession = useSelector(getMonitor);
  const lastSeqIdRef = useRef<number>();
  const subscription = useRef<Subscription>();
  const [syncMessageByUser, { data, refetch }] =
    useLazyQuery<SyncMessageByUserGraphql>(QUERY_SYNC_USER_MESSAGE, {
      fetchPolicy: 'no-cache',
    });

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
