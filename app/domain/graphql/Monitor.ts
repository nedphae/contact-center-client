import { gql } from '@apollo/client';

import Staff, { StaffGroup, StaffShunt } from 'app/domain/StaffInfo';
import { CustomerStatus } from '../Customer';

export interface MonitorGraphql {
  staffOnlineList: {
    staffStatusList: Staff[];
    staffList: Staff[];
    staffGroupList: StaffGroup[];
    staffShuntList: StaffShunt[];
    customerList: CustomerStatus[];
  };
}

export const QUERY_MONITOR = gql`
  query monitor {
    staffOnlineList {
      staffStatusList {
        autoBusy
        currentServiceCount
        groupId
        loginTime
        maxServiceCount
        onlineStatus
        organizationId
        priorityOfShuntMap
        role
        shunt
        id: staffId
        staffType
        userIdList
      }
      staffList {
        avatar
        enabled
        gender
        id
        maxTicketAllTime
        maxTicketPerDay
        mobilePhone
        nickName
        organizationId
        password
        personalizedSignature
        realName
        role
        simultaneousService
        staffGroupId
        staffType
        username
      }
      staffGroupList {
        groupName
        id
        organizationId
      }
      staffShuntList {
        code
        id
        name
        organizationId
        shuntClassId
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
        robotShuntSwitch
        # 访客选择多入口分流模版id
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
      }
    }
  }
`;
