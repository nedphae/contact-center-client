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

import { CustomerStatus } from 'renderer/domain/Customer';
import Staff, { StaffGroup } from 'renderer/domain/StaffInfo';
import { from, of, zip } from 'rxjs';
import { groupBy, map, mergeMap, toArray } from 'rxjs/operators';
import useMonitorUserAndMsg from 'renderer/hook/init/useMonitorUserAndMsg';
import { setMonitorSelectedSession } from 'renderer/state/chat/chatAction';
import {
  MonitorGraphql,
  QUERY_CUUSTOMER_AND_LAST_CONV,
  QUERY_MONITOR,
  QUERY_STORED_MONITOR,
  StoredMonitorGraphql,
} from 'renderer/domain/graphql/Monitor';
import { ConversationUserIdGraphql } from 'renderer/domain/graphql/Conversation';
import { CustomerGraphql } from 'renderer/domain/graphql/customer';
import { Monitored } from 'renderer/domain/Chat';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      overflow: 'auto',
      height: '80vh',
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    nestedDouble: {
      paddingLeft: theme.spacing(8),
    },
  })
);

interface MonitorProps {
  refreshInterval?: number;
}

type CustomerAndConversationGraphql = Object.Merge<
  CustomerGraphql,
  ConversationUserIdGraphql
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

  const { data: storeMonitorData } = useQuery<StoredMonitorGraphql>(
    QUERY_STORED_MONITOR,
    {
      fetchPolicy: 'no-cache',
    }
  );
  const { data } = useQuery<MonitorGraphql>(QUERY_MONITOR, {
    pollInterval: refreshInterval ?? 5000,
  });
  // 懒加载 用户信息，降低服务器一次性获取的数据量
  const [getCustomerInfo, { data: monitoredUserData }] =
    useLazyQuery<CustomerAndConversationGraphql>(QUERY_CUUSTOMER_AND_LAST_CONV);

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
            monitoredConversation: monitoredUserData.getLastConversation,
          })
        )
      );
    }
  }, [dispatch, monitored, monitoredUserData]);

  // 同步在线列表
  useEffect(() => {
    return () => {
      dispatch(setMonitorSelectedSession(undefined));
    };
  }, [dispatch]);

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
  if (data && storeMonitorData) {
    const { staffStatusList, customerList } = data;
    const { allStaffGroup } = storeMonitorData;
    const mapOfCustomer = _.groupBy(customerList, 'userId');

    from(staffStatusList)
      .pipe(
        map((s) => {
          const tempCustomerList = s.userIdList
            .map((id) => mapOfCustomer[id.toString()])
            .filter((customer) => customer)
            .map((id) => id[0]);

          // 合并 staff 和 status 对象
          return _.defaults({ customerList: tempCustomerList }, s, s.staff);
        }),
        groupBy((s) => s.groupId),
        mergeMap((group) => zip(of(group.key), group.pipe(toArray())))
      )
      .subscribe((z) => {
        grouOfStaff.set(z[0], z[1]);
      });

    resultList = allStaffGroup.map((element) =>
      _.defaults({ staffList: grouOfStaff.get(element.id) }, element)
    );
  }
  return (
    <List
      dense
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
                                  className={classes.nestedDouble}
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
