import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import {
  ConversationStaffIdGraphql,
  QUERY_CONV_BY_STAFFID,
} from 'renderer/domain/graphql/Conversation';
import { updateOrCreateConv } from 'renderer/state/session/sessionAction';
import { useAppDispatch } from 'renderer/store';
/**
 * 用于初始化数据，载入：
 *
 * 配置、快捷回复、咨询类型
 * 等
 *
 * 默认使用 apollo cache，多次载入不会读取远程数据
 */
const useAutoLoadConv = () => {
  const dispatch = useAppDispatch();

  const { data: onlineConverList, refetch } =
    useQuery<ConversationStaffIdGraphql>(QUERY_CONV_BY_STAFFID);

  // 获取客服当前联系的会话，防止刷新了客户端后会话丢失
  useEffect(() => {
    if (onlineConverList && onlineConverList.onlineConversationByStaffId) {
      onlineConverList.onlineConversationByStaffId.forEach((it) => {
        // TODO: 优化为 batch
        dispatch(updateOrCreateConv(it));
      });
    }
  }, [dispatch, onlineConverList]);

  return [
    () => {
      refetch();
    },
  ];
};

export default useAutoLoadConv;
