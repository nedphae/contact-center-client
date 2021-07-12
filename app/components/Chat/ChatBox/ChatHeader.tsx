/**
 * 聊天窗口头，显示用户信息，和基本统计
 */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import {
  getSelectedConstomer,
  getSelectedSession,
} from 'app/state/session/sessionAction';

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
  const session = useSelector(getSelectedSession);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (session) {
      timer = setInterval(() => {
        const duration =
          (new Date().getTime() - session.startTime.getTime()) / 1000 ?? 0;
        setSessionDuration(duration);
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [session]);

  return (
    <AppBar position="sticky" className={classes.appBar}>
      <Toolbar className={classes.toolBar}>
        <Avatar alt="Profile Picture" />
        <Grid container spacing={0}>
          <Grid item xs={9} zeroMinWidth>
            <Typography
              noWrap
              style={{ paddingLeft: 10 }}
              variant="body2"
              // 后面看是否要删除 inline
              display="inline"
              color="secondary"
            >
              {user?.name ?? user?.uid} {/** 获取用户信息 */}
            </Typography>
          </Grid>
          <Grid item xs={3} zeroMinWidth>
            <Typography
              noWrap
              align="center"
              variant="body2"
              color="textSecondary"
            >
              咨询时长：{sessionDuration} 秒 {/** 获取会话时长 */}
            </Typography>
          </Grid>
          <Grid item xs={12} zeroMinWidth>
            <Typography noWrap variant="body2">
              Scroll to Elevate App Bar
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
