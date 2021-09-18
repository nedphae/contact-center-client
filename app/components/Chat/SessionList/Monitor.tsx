import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useLazyQuery, useQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Object } from 'ts-toolbelt';

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
import Staff, { StaffGroup } from 'app/domain/StaffInfo';
import { from, interval, of, Subscription, zip } from 'rxjs';
import { groupBy, map, mergeMap, toArray } from 'rxjs/operators';
import useMonitorUserAndMsg, {
  QUERY,
} from 'app/hook/init/useMonitorUserAndMsg';
import { setMonitorSelectedSession } from 'app/state/chat/chatAction';
import { MonitorGraphql, QUERY_MONITOR } from 'app/domain/graphql/Monitor';
import { ConversationGraphql } from 'app/domain/graphql/Conversation';
import { CustomerGraphql } from 'app/domain/graphql/Customer';
import { Monitored } from 'app/domain/Chat';

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

interface MonitorProps {
  refreshInterval?: number;
}

type CustomerAndConversationGraphql = Object.Merge<
  CustomerGraphql,
  ConversationGraphql
>;

function SyncUserMessage() {
  useMonitorUserAndMsg(1000);
  return <></>;
}

function Monitor(props: MonitorProps) {
  const { refreshInterval } = props;
  const classes = useStyles();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(-1);
  const [staffOpen, setStaffOpen] = useState(-1);
  const [monitored, setMonitored] = useState<Monitored>();

  const { data, refetch } = useQuery<MonitorGraphql>(QUERY_MONITOR);
  // 懒加载 用户信息，降低服务器一次性获取的数据量
  const [getCustomerInfo, { data: monitoredUserData }] =
    useLazyQuery<CustomerAndConversationGraphql>(QUERY);

  useEffect(() => {
    if (
      monitored &&
      monitoredUserData &&
      monitoredUserData.getCustomer.userId ===
        monitored.monitoredUserStatus.userId
    ) {
      dispatch(
        setMonitorSelectedSession(
          _.defaults({}, monitored, {
            monitoredUser: monitoredUserData.getCustomer,
            monitoredConversation: monitoredUserData.getConversation,
          })
        )
      );
    }
  }, [dispatch, monitored, monitoredUserData]);

  // 同步在线列表
  useEffect(() => {
    const tempSubscription: Subscription = interval(
      refreshInterval ?? 5
    ).subscribe(() => {
      refetch();
    });
    return () => {
      if (tempSubscription) {
        tempSubscription.unsubscribe();
      }
      dispatch(setMonitorSelectedSession(undefined));
    };
  }, [dispatch, refetch, refreshInterval]);

  const handleClick = (index: number) => {
    setOpen(index);
  };

  const handleClickStaff = (index: number) => {
    setStaffOpen(index);
  };

  const handleClickCustomer = (
    monitoredStaff: Staff,
    monitoredUserStatus: CustomerStatus
  ) => {
    getCustomerInfo({
      variables: { userId: monitoredUserStatus.userId },
    });
    setMonitored({
      monitoredStaff,
      monitoredUserStatus,
    });
  };

  const grouOfStaff = new Map<number, Staff[]>();
  let resultList: StaffGroup[] | undefined;
  if (data) {
    const { staffStatusList, staffList, staffGroupList, customerList } =
      data.staffOnlineList;
    const mapOfStaffStatus = _.groupBy(staffList, 'id');
    const mapOfCustomer = _.groupBy(customerList, 'userId');

    from(staffStatusList)
      .pipe(
        map((s) => {
          const tempCustomerList = s.userIdList
            .map((id) => mapOfCustomer[id.toString()])
            .filter((customer) => customer)
            .map((id) => id[0]);
          const tempStaff = _.defaults({ customerList: tempCustomerList }, s);
          // 合并 staff 和 status 对象
          return _.defaults(tempStaff, mapOfStaffStatus[s.id.toString()][0]);
        }),
        groupBy((s) => s.groupId),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray())))
      )
      .subscribe((z) => grouOfStaff.set(z[0], z[1]));

    resultList = staffGroupList.map((element) =>
      _.defaults({ staffList: grouOfStaff.get(element.id) }, element)
    );
  }
  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={classes.root}
    >
      <SyncUserMessage />
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
                                  onClick={() => handleClickCustomer(st, cs)}
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
  refreshInterval: 5000,
};

export default Monitor;
