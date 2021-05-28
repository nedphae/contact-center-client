/**
 * 聊天窗口界面，包括联系人列表，聊天窗口，用户信息窗口三部分组成
 * 使用 material-ui 重新设计UI，使与整体应用UI保持一致
 */
import React from 'react';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import SessionList from './SessionList/SessionPanel';
import Chat from './ChatBox/Chat';
import DetailCard from './DetailCard/DetailCard';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
    },
  })
);

export default function ChatApp() {
  const classes = useStyles();

  return (
    <Grid container className={classes.root} spacing={0}>
      <Grid item xs={12}>
        <Grid container justify="center" spacing={0}>
          <Grid item xs={2}>
            <SessionList />
          </Grid>
          <Grid item xs={7}>
            <Chat />
          </Grid>
          <Grid item xs={3}>
            <DetailCard />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
