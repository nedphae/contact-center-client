import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { useLazyQuery } from '@apollo/client';
import { getMonitor } from 'renderer/state/chat/chatAction';
import { interval, Subscription } from 'rxjs';
import {
  SyncMessageByUserGraphql,
  QUERY_SYNC_USER_MESSAGE,
} from 'renderer/domain/graphql/Monitor';

const useMonitorUserAndMsg = (refreshInterval: number) => {
  const monitorSession = useSelector(getMonitor);
  const lastSeqIdRef = useRef<number>();
  const subscription = useRef<Subscription>();
  const [syncMessageByUser, { data, fetchMore }] =
    useLazyQuery<SyncMessageByUserGraphql>(QUERY_SYNC_USER_MESSAGE);

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
    }
  }, [data, userId]);

  // 同步消息
  useEffect(() => {
    if (userId && fetchMore && !subscription.current) {
      subscription.current = interval(refreshInterval).subscribe(() => {
        const cursor = lastSeqIdRef.current
          ? lastSeqIdRef.current + 1
          : lastSeqIdRef.current;
        fetchMore({
          variables: { userId, cursor },
          updateQuery(previousQueryResult, options) {
            const newMessageList = [
              ...options.fetchMoreResult.syncMessageByUser.content,
              ...(previousQueryResult.syncMessageByUser?.content ?? []),
            ];
            options.fetchMoreResult.syncMessageByUser.content = newMessageList;
            return options.fetchMoreResult;
          },
        });
      });
    }
    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
        subscription.current = undefined;
      }
      lastSeqIdRef.current = undefined;
    };
  }, [fetchMore, refreshInterval, userId]);

  return [data?.syncMessageByUser.content];
};

export default useMonitorUserAndMsg;
