import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useLazyQuery } from '@apollo/client';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { getSelectedConstomer } from 'app/state/chat/chatAction';
import {
  CustomerStatusGraphql,
  QUERY_CUSTOMER_STATUS,
} from 'app/domain/graphql/Customer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    actionsContainer: {
      margin: theme.spacing(2),
    },
    resetContainer: {
      padding: theme.spacing(3),
    },
  })
);

const fakeUserTrack = {
  userTrackList: [
    {
      url: 'https://www.baidu.com',
      title: '百度',
      enterTime: 1650372531.98,
      updateTime: 1650372535.98,
      awayTime: 1650372535.98,
    },
    {
      url: 'https://www.qq.com',
      title: '腾讯',
      enterTime: 1650372531.98,
      updateTime: 1650372535.98,
      awayTime: 1650372535.98,
    },
    {
      url: 'https://www.bing.com',
      title: '必应',
      enterTime: 1650372531.98,
      updateTime: 1650372535.98,
      awayTime: 1650372539.98,
    },
    {
      url: 'https://www.163.com',
      title: '网易',
      enterTime: 1650372531.98,
      updateTime: 1650372535.98,
      awayTime: 1650372535.98,
    },
    {
      url: 'https://www.xbcs.top',
      title: '小白客服',
      enterTime: 1650372531.98,
      updateTime: 1650372535.98,
      awayTime: 1650372535.98,
    },
    {
      url: 'https://www.google.com',
      title: '谷歌',
      enterTime: 1650372531.98,
      updateTime: 1650372535.98,
    },
  ],
};

export default function UserTrack() {
  const classes = useStyles();
  // const status = fakeUserTrack;
  const tempStatus = useSelector(getSelectedConstomer)?.status;
  const [status, setStatus] = useState(tempStatus);
  const [getStatus, { data, refetch }] = useLazyQuery<CustomerStatusGraphql>(
    QUERY_CUSTOMER_STATUS,
    {
      variables: { userId: status?.userId },
      fetchPolicy: 'no-cache',
    }
  );

  useEffect(() => {
    if (data?.getCustomerStatus) {
      setStatus(data?.getCustomerStatus);
    } else {
      getStatus({ variables: { userId: status?.userId } });
    }
  }, [data, getStatus, status]);

  const activeStep =
    status?.userTrackList?.filter((it) => it.awayTime).length ?? 0;

  return (
    <>
      {status && status.userTrackList && (
        <div className={classes.root}>
          <Stepper nonLinear activeStep={activeStep} orientation="vertical">
            {status.userTrackList.map((userTrack) => {
              const time = userTrack.awayTime
                ? `时长: ${Math.trunc(
                    userTrack.awayTime - userTrack.enterTime
                  )} 秒`
                : '正在访问';
              return (
                <Step key={userTrack.url}>
                  <StepLabel>{`${time}, 页面: ${userTrack.url}`}</StepLabel>
                  <StepContent>
                    <Typography>{userTrack.title}</Typography>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === status.userTrackList.length && (
            <Paper square elevation={0} className={classes.resetContainer}>
              <Typography>用户已经离开网页</Typography>
            </Paper>
          )}
          {refetch && (
            <div className={classes.actionsContainer}>
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    refetch();
                  }}
                  className={classes.button}
                >
                  刷新
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
