/**
 * 聊天窗口头，显示用户信息，和基本统计
 */
import React from 'react';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { Conversation } from 'app/domain/Conversation';

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

interface DetailTitleProps {
  conv: Conversation;
}

export default function DetailTitle(props: DetailTitleProps) {
  const { conv } = props;
  const classes = useStyles();
  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar className={classes.toolBar}>
        <Grid container spacing={0}>
          <Grid item xs={4} zeroMinWidth>
            <Typography
              noWrap
              style={{ paddingLeft: 10 }}
              variant="body2"
              // 后面看是否要删除 inline
              display="inline"
            >
              {conv?.userName}
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
              {conv && conv?.region?.replaceAll(/\||0/g, '')}
            </Typography>
          </Grid>
          <Grid item xs={3} zeroMinWidth />
          {conv && (
            <>
              <Grid item xs={5} zeroMinWidth>
                <Typography noWrap style={{ paddingLeft: 10 }} variant="body2">
                  {conv.evaluate
                    ? `评价结果: ${conv.evaluate.evaluation} 分，内容：${conv.evaluate.evaluationRemark}`
                    : `未评价`}
                </Typography>
              </Grid>
              <Grid item xs={4} zeroMinWidth>
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
