import React, { useState } from 'react';
import _ from 'lodash';
import { gql, useSubscription } from '@apollo/client';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CustomerStatus } from 'app/domain/Customer';
import Staff, { StaffGroup, StaffShunt } from 'app/domain/StaffInfo';
import { from, of, zip } from 'rxjs';
import { groupBy, map, mergeMap, toArray } from 'rxjs/operators';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
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

export const MONITOR_SUBSCRIPTION = gql`
  subscription monitor($seconds: Long) {
    staffOnlineList(seconds: $seconds)
  }
`;

interface MonitorProps {
  refreshInterval?: number;
}

function Monitor(props: MonitorProps) {
  const { refreshInterval } = props;
  const classes = useStyles();
  const { data, loading } = useSubscription<Graphql>(MONITOR_SUBSCRIPTION, {
    variables: { seconds: refreshInterval },
  });

  const grouOfStaff = new Map<number, Staff[]>();
  // TODO: group by staff Shunt 根据接待组进行分组展示

  if (data) {
    const {
      staffStatusList,
      staffList,
      staffGroupList,
      staffShuntList,
      customerList,
    } = data.staffOnlineList;
    const mapOfStaffStatus = _.groupBy(staffList, 'id');
    const mapOfCustomer = _.groupBy(customerList, 'id');

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
  }
}

Monitor.defaultProps = {
  refreshInterval: 5,
};

export default Monitor;
