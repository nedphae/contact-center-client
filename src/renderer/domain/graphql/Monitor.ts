import { gql } from '@apollo/client';

import Staff, { StaffGroup, StaffShunt } from 'renderer/domain/StaffInfo';
import { MSG_PAGE_QUERY } from 'renderer/domain/graphql/Message';
import { Message } from 'renderer/domain/Message';
import { PageResult } from 'renderer/domain/Page';
import { CONVERSATION_FIELD } from 'renderer/domain/graphql/Conversation';
import { CustomerStatus } from '../Customer';
import { STAFF_FIELD } from './Staff';

export interface MonitorGraphql {
  staffStatusList: Staff[];
  customerList?: CustomerStatus[];
}

export interface StoredMonitorGraphql {
  allStaff: Staff[];
  allStaffGroup: StaffGroup[];
  allStaffShunt: StaffShunt[];
}

export const QUERY_STORED_MONITOR = gql`
  ${STAFF_FIELD}
  query StoredMonitor {
    allStaff {
      ...staffFields
    }
    allStaffGroup {
      groupName
      id
      organizationId
    }
    allStaffShunt {
      code
      id
      name
      organizationId
      shuntClassId
    }
  }
`;

export const QUERY_MONITOR_WITHOUT_CUSTOMER = gql`
  query Monitor {
    staffStatusList {
      autoBusy
      currentServiceCount
      groupId
      loginTime
      maxServiceCount
      onlineStatus
      organizationId
      priorityOfShunt
      role
      shunt
      id: staffId
      staffType
      userIdList
    }
  }
`;

export const QUERY_MONITOR = gql`
  query Monitor {
    staffStatusList {
      autoBusy
      currentServiceCount
      groupId
      loginTime
      maxServiceCount
      onlineStatus
      organizationId
      priorityOfShunt
      role
      shunt
      id: staffId
      staffType
      userIdList
    }
    customerList {
      fromType
      # 指定客服组id
      groupId
      # 客户IP
      ip
      # 登录时间
      loginTime
      # 是否在线
      onlineStatus
      # 公司id
      organizationId
      # 自定义访客咨询来源页的url，不配置sdk会自动抓取，和title一起使用
      referrer
      # 机器人优先开关（访客分配）
      # robotShuntSwitch
      # 访客选择多入口接待模版id
      shuntId
      # 指定客服id
      staffId
      # 自定义访客咨询来源页的标题，不配置sdk会自动抓取, 和referrer一起使用
      title
      # 客户提交id
      uid
      # 客户系统id
      userId
      # vip等级 1-10
      vipLevel
      region
    }
  }
`;

export const QUERY_SYNC_USER_MESSAGE = gql`
  ${MSG_PAGE_QUERY}
  query SyncMessageByUser($userId: Long!, $cursor: Long) {
    syncMessageByUser(userId: $userId, cursor: $cursor, end: null) {
      ...pageOnMessagePage
    }
  }
`;

export interface SyncMessageByUserGraphql {
  syncMessageByUser: PageResult<Message>;
}

export const QUERY_CUUSTOMER_AND_LAST_CONV = gql`
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
      tags {
        name
        color
      }
    }
    getLastConversation(userId: $userId) {
      ...conversationFields
    }
  }
`;
