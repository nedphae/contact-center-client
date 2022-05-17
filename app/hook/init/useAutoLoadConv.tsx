import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import { useQuery } from '@apollo/client';

import {
  ConversationStaffIdGraphql,
  QUERY_CONV_BY_STAFFID,
} from 'app/domain/graphql/Conversation';
import { updateOrCreateConv } from 'app/state/session/sessionAction';
/**
 * 用于初始化数据，载入：
 *
 * 配置、快捷回复、咨询类型
 * 等
 *
 * 默认使用 apollo cache，多次载入不会读取远程数据
 */
const useAutoLoadConv = (): void => {
  const dispatch = useDispatch();

  const { data: onlineConverList } = useQuery<ConversationStaffIdGraphql>(
    QUERY_CONV_BY_STAFFID
  );

  // 获取客服当前联系的会话，防止刷新了客户端后会话丢失
  useEffect(() => {
    if (onlineConverList && onlineConverList.onlineConversationByStaffId) {
      onlineConverList.onlineConversationByStaffId.forEach((it) => {
        // TODO: 优化为 batch
        dispatch(updateOrCreateConv(it));
      });
    }
  }, [dispatch, onlineConverList]);
};

export default useAutoLoadConv;
