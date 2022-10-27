/**
 * 聊天窗口头，显示用户信息，和基本统计
 */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import {
  getDuration,
  javaInstant2Num,
  setIntervalAndExecute,
} from 'renderer/utils/timeUtils';
import UserHeader from 'renderer/components/Header/UserHeader';
import {
  getSelectedConstomer,
  getSelectedConv,
  getSelectedSession,
} from 'renderer/state/chat/chatAction';
import { getEvaluation, useEvalProp } from 'renderer/domain/Conversation';
import { Tooltip } from '@material-ui/core';

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
  }),
);

export default function ChatHeader() {
  const classes = useStyles();
  const { t } = useTranslation();

  const session = useSelector(getSelectedSession);
  const conv = useSelector(getSelectedConv);
  const user = useSelector(getSelectedConstomer);
  const [sessionDuration, setSessionDuration] = useState<number>();
  const evalProp = useEvalProp();

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
        {/* 宽度减去头像宽度，防止溢出 */}
        <Grid container spacing={0} style={{ width: 'calc(100% - 40px)' }}>
          <Grid item xs={4} zeroMinWidth>
            <Typography
              noWrap
              style={{ paddingLeft: 10 }}
              variant="body2"
              // 后面看是否要删除 inline
              display="inline"
            >
              {/** 获取用户信息 */}
              {user?.name ?? user?.uid}
            </Typography>
          </Grid>
          <Grid item xs={4} zeroMinWidth>
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
          <Grid item xs={4} zeroMinWidth>
            {sessionDuration && (
              <Typography noWrap align="center" variant="body2">
                {/** 获取会话时长 */}
                {t('header.Chat Duration')}
                {': '}
                {getDuration(sessionDuration)}
{' '}
                {conv?.closeReason === 'TRANSFER'
                  ? t('header.Conversation Transferred')
                  : ''}
              </Typography>
            )}
          </Grid>
          {conv && (
            <>
              <Grid item xs={5} zeroMinWidth>
                {session && session.userTypingText && (
                  <Tooltip title={session.userTypingText}>
                    <Typography
                      noWrap
                      style={{ paddingLeft: 10 }}
                      variant="body2"
                    >
                      <strong>{`${t('header.User Typing')}: `}</strong>
                      {session.userTypingText}
                    </Typography>
                  </Tooltip>
                )}
              </Grid>
              <Grid item xs={4} zeroMinWidth>
                <Typography noWrap style={{ paddingLeft: 10 }} variant="body2">
                  {conv.evaluate && evalProp
                    ? `${t('header.Rated Result')}: ${getEvaluation(
                        evalProp,
                        conv.evaluate.evaluation
                    )}, ${t('header.Rated Content')}: ${
                      conv.evaluate.evaluationRemark
                      }`
                    : t('header.Unrated')}
                </Typography>
              </Grid>
              <Grid item xs={3} zeroMinWidth>
                <Typography noWrap variant="body2">
                  {conv.category
                    ? `${t('header.Category')}: ${conv.category}`
                    : t('header.No Category')}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
