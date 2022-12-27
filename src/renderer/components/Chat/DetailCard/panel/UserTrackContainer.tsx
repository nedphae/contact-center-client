import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { useLazyQuery } from '@apollo/client';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { getSelectedConstomer } from 'renderer/state/chat/chatAction';
import { updateCustomerStatus } from 'renderer/state/session/sessionAction';
import {
  CustomerStatusGraphql,
  QUERY_CUSTOMER_STATUS,
} from 'renderer/domain/graphql/Customer';
import UserTrackViewer from './UserTrackViewer';

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

export default function UserTrackContainer() {
  const classes = useStyles();
  const { t } = useTranslation();

  // const status = fakeUserTrack;
  const dispatch = useDispatch();
  const status = useSelector(getSelectedConstomer)?.status;
  const [getStatus, { data }] = useLazyQuery<CustomerStatusGraphql>(
    QUERY_CUSTOMER_STATUS,
    {
      variables: { userId: status?.userId },
      fetchPolicy: 'no-cache',
    }
  );

  useEffect(() => {
    if (data?.getCustomerStatus) {
      dispatch(updateCustomerStatus(data?.getCustomerStatus));
    }
  }, [data, dispatch]);

  const activeStep =
    status?.userTrackList?.filter((it) => it.awayTime).length ?? 0;

  return (
    <>
      {status && status.userTrackList && (
        <div className={classes.root}>
          <UserTrackViewer userTrackList={status.userTrackList} />
          {activeStep === status.userTrackList.length && (
            <Paper square elevation={0} className={classes.resetContainer}>
              <Typography>{t('The user has left the webpage')}</Typography>
            </Paper>
          )}
          {getStatus && (
            <div className={classes.actionsContainer}>
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    getStatus();
                  }}
                  className={classes.button}
                >
                  {t('Refresh')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
