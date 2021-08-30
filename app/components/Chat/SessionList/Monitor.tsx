import React, { useState } from 'react';
import _ from 'lodash';
import { gql, useSubscription } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import ChatIcon from '@material-ui/icons/Chat';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { CustomerStatus } from 'app/domain/Customer';
import Staff, { StaffGroup, StaffShunt } from 'app/domain/StaffInfo';
import { from, of, zip } from 'rxjs';
import { groupBy, map, mergeMap, toArray } from 'rxjs/operators';
import useMonitorUserAndMsg from 'app/hook/init/useMonitorUserAndMsg';
import {
  getMonitorSelectedSession,
  setMonitorSelectedSession,
} from 'app/state/chat/chatAction';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  })
);

interface Graphql {
  staffOnlineList: {
    staffStatusList: Staff[];
    staffList: Staff[];
    staffGroupList: StaffGroup[];
    staffShuntList: StaffShunt[];
    customerList: CustomerStatus[];
  };
}

const MONITOR_SUBSCRIPTION = gql`
  subscription monitor($seconds: Long) {
    staffOnlineList(seconds: $seconds) {
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

interface MonitorProps {
  refreshInterval?: number;
}

function SyncUserMessage(userId: number, refreshInterval = 5) {
  useMonitorUserAndMsg(userId, refreshInterval);
  return <></>;
}

function Monitor(props: MonitorProps) {
  const { refreshInterval } = props;
  const classes = useStyles();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(-1);
  const [staffOpen, setStaffOpen] = useState(-1);
  const selectedSession = useSelector(getMonitorSelectedSession);

  const { data } = useSubscription<Graphql>(MONITOR_SUBSCRIPTION, {
    variables: { seconds: refreshInterval },
  });

  const handleClick = (index: number) => {
    setOpen(index);
  };

  const handleClickStaff = (index: number) => {
    setStaffOpen(index);
  };

  const handleClickCustomer = (
    userId: number,
    monitoredStaff: Staff,
    monitoredUserStatus: CustomerStatus
  ) => {
    dispatch(
      setMonitorSelectedSession({
        selectedSession: userId,
        monitoredStaff,
        monitoredUserStatus,
        monitoredMessageList: {},
      })
    );
  };

  const grouOfStaff = new Map<number, Staff[]>();
  let resultList: StaffGroup[] | undefined = undefined;
  // TODO: group by staff Shunt 根据接待组进行分组展示
  if (data) {
    const { staffStatusList, staffList, staffGroupList, customerList } =
      data.staffOnlineList;
    const mapOfStaffStatus = _.groupBy(staffList, 'id');
    const mapOfCustomer = _.groupBy(customerList, 'userId');

    from(staffStatusList)
      .pipe(
        map((s) => {
          s.customerList = s.userIdList.map(
            (id) => mapOfCustomer[id.toString()][0]
          );
          // 合并 staff 和 status 对象
          return _.defaults(s, mapOfStaffStatus[s.id.toString()][0]);
        }),
        groupBy((s) => s.groupId),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray())))
      )
      .subscribe((z) => grouOfStaff.set(z[0], z[1]));

    staffGroupList.forEach((element) => {
      element.staffList = grouOfStaff.get(element.id);
    });
    resultList = staffGroupList;
  }
  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={classes.root}
    >
      {selectedSession &&
        SyncUserMessage(selectedSession.conversation.userId, refreshInterval)}
      {resultList &&
        resultList.map((group, index) => (
          <React.Fragment key={group.id}>
            <ListItem button onClick={() => handleClick(index)}>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary={group.groupName} />
              {open === index ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={open === index} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {group.staffList &&
                  group.staffList.map((st, sIndex) => (
                    <React.Fragment key={st.id}>
                      <ListItem
                        button
                        className={classes.nested}
                        onClick={() => handleClickStaff(sIndex)}
                      >
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={st.realName}
                          secondary={st.nickName}
                        />
                        {staffOpen === sIndex ? <ExpandLess /> : <ExpandMore />}
                      </ListItem>
                      <Collapse
                        in={staffOpen === sIndex}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          {st.customerList &&
                            st.customerList.map((cs) => (
                              <React.Fragment key={cs.userId}>
                                <ListItem
                                  button
                                  className={classes.nested}
                                  onClick={() =>
                                    handleClickCustomer(cs.userId, st, cs)
                                  }
                                >
                                  <ListItemIcon>
                                    <ChatIcon />
                                  </ListItemIcon>
                                  <ListItemText primary={cs.uid} />
                                </ListItem>
                              </React.Fragment>
                            ))}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
    </List>
  );
}

Monitor.defaultProps = {
  refreshInterval: 5,
};

export default Monitor;
