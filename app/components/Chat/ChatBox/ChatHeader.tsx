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
  getSelectedConstomer,
  getSelectedConv,
} from 'app/state/session/sessionAction';
import { javaInstant2Num } from 'app/utils/timeUtils';
import UserHeader from 'app/components/Header/UserHeader';

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
  const user = useSelector(getSelectedConstomer);
  const session = useSelector(getSelectedConv);
  const [sessionDuration, setSessionDuration] = useState<number>();

  useEffect(() => {
    let timer: number;
    if (session) {
      if (session.endTime) {
        const duration =
          (javaInstant2Num(session.endTime).getTime() -
            javaInstant2Num(session.startTime).getTime()) /
          1000;
        setSessionDuration(Math.trunc(duration));
      } else {
        timer = setInterval(() => {
          const duration =
            (new Date().getTime() -
              javaInstant2Num(session.startTime).getTime()) /
              1000 ?? 0;
          setSessionDuration(Math.trunc(duration));
        }, 1000);
      }
    }

    return () => {
      clearInterval(timer);
    };
  }, [session]);

  return (
    <AppBar position="sticky" className={classes.appBar}>
      <Toolbar className={classes.toolBar}>
        {user && user.status && <UserHeader status={user.status} />}
        <Grid container spacing={0}>
          <Grid item xs={9} zeroMinWidth>
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
          <Grid item xs={3} zeroMinWidth>
            {sessionDuration && (
              <Typography noWrap align="center" variant="body2">
                咨询时长：{sessionDuration} 秒 {/** 获取会话时长 */}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} zeroMinWidth>
            <Typography noWrap style={{ paddingLeft: 10 }} variant="body2">
              &nbsp;
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
