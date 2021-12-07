/**
 * 聊天窗口头，显示用户信息，和基本统计
 */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import {
  getDuration,
  javaInstant2Num,
  setIntervalAndExecute,
} from 'app/utils/timeUtils';
import UserHeader from 'app/components/Header/UserHeader';
import {
  getSelectedConstomer,
  getSelectedConv,
} from 'app/state/chat/chatAction';

const useStyles = makeStyles(() =>
  createStyles({
    appBar: {
      height: 50,
      justifyContent: 'center',
      zIndex: 'auto',
    },
    toolBar: {
      height: 50,
    },
  })
);

export default function ChatHeader() {
  const classes = useStyles();
  const conv = useSelector(getSelectedConv);
  const user = useSelector(getSelectedConstomer);
  const [sessionDuration, setSessionDuration] = useState<number>();

  useEffect(() => {
    let timer: number;
    if (conv) {
      if (conv.endTime) {
        const duration =
          (javaInstant2Num(conv.endTime).getTime() -
            javaInstant2Num(conv.startTime).getTime()) /
          1000;
        setSessionDuration(Math.trunc(duration));
      } else {
        timer = setIntervalAndExecute(() => {
          const duration =
            (new Date().getTime() - javaInstant2Num(conv.startTime).getTime()) /
              1000 ?? 0;
          setSessionDuration(Math.trunc(duration));
        }, 1000);
      }
    } else {
      setSessionDuration(undefined);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [conv]);

  return (
    <AppBar position="sticky" className={classes.appBar}>
      <Toolbar className={classes.toolBar}>
        {user && user.status && <UserHeader status={user.status} />}
        <Grid container spacing={0}>
          <Grid item xs={4} zeroMinWidth>
            <Typography
              noWrap
              style={{ paddingLeft: 10 }}
              variant="body2"
              // 后面看是否要删除 inline
              display="inline"
            >
              {user?.name ?? user?.uid} {/** 获取用户信息 */}
            </Typography>
          </Grid>
          <Grid item xs={5} zeroMinWidth>
            <Typography
              noWrap
              style={{ paddingLeft: 10 }}
              variant="body2"
              // 后面看是否要删除 inline
              display="inline"
            >
              {user &&
                user.status &&
                user.status?.region?.replaceAll(/\||0/g, '')}
            </Typography>
          </Grid>
          <Grid item xs={3} zeroMinWidth>
            {sessionDuration && (
              <Typography noWrap align="center" variant="body2">
                咨询时长：{getDuration(sessionDuration)}
                {/** 获取会话时长 */}
              </Typography>
            )}
          </Grid>
          {conv && (
            <>
              <Grid item xs={4} zeroMinWidth>
                <Typography noWrap style={{ paddingLeft: 10 }} variant="body2">
                  {conv.evaluate
                    ? `评价结果: ${conv.evaluate.evaluation} 分`
                    : `未评价`}
                </Typography>
              </Grid>
              <Grid item xs={8} zeroMinWidth>
                <Typography noWrap variant="body2">
                  {conv.category ? `已总结: ${conv.category}` : `未总结`}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
