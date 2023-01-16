/**
 * 聊天窗口头，显示用户信息，和基本统计
 */

import { createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import {
  Conversation,
  getEvaluation,
  useEvalProp,
} from 'renderer/domain/Conversation';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const evalProp = useEvalProp();

  return (
    <AppBar position="static" color="default" className={classes.appBar}>
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
              <Grid item xs={4} zeroMinWidth>
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
