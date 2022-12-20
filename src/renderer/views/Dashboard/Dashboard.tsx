import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
// react plugin for creating charts
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';
// @material-ui/icons
import SyncIcon from '@material-ui/icons/Sync';
import { Icon } from '@iconify/react';
import peopleQueue24Filled from '@iconify/icons-fluent/people-queue-24-filled';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import InfoIcon from '@material-ui/icons/Info';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import LocalOffer from '@material-ui/icons/LocalOffer';
import HeadsetMicIcon from '@material-ui/icons/HeadsetMic';
import TabIcon from '@material-ui/icons/Tab';
// core components
import { gql, useQuery } from '@apollo/client';
import {
  RealTimeStatisticsGraphql,
  QUERY_REALTIME_STATISTICS,
} from 'renderer/domain/graphql/RealTimeStatistics';
import { defaultRealTimeStatistics } from 'renderer/domain/RealTimeStatistics';
import { interval, Subscription } from 'rxjs';
import useAlert from 'renderer/hook/alert/useAlert';
import clientConfig, {
  getDashboardUrlById,
  getKibanaSpaceUrl,
} from 'renderer/config/clientConfig';
import SpeedDials from 'renderer/components/SpeedDials/SpeedDials';
import GridItem from '../../components/Grid/GridItem';
import GridContainer from '../../components/Grid/GridContainer';
import Danger from '../../components/Typography/Danger';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardIcon from '../../components/Card/CardIcon';
import CardFooter from '../../components/Card/CardFooter';

import styles from '../../assets/jss/material-dashboard-react/views/dashboardStyle';

const useStyles = makeStyles(styles);

interface KibanaUrl {
  kibanaUsername?: string;
  kibanaPassword?: string;
  kibanaUrl?: string;
}

interface KibanaUrlGraphql {
  getKibanaUrl: KibanaUrl;
}

export const QUERY_KIBANA_URL = gql`
  query KibanaUrl {
    getKibanaUrl {
      kibanaUsername
      kibanaPassword
      kibanaUrl
    }
  }
`;

interface KibanaUrlString {
  spaceId: string;
  conv: string;
  staff: string;
}

export default function Dashboard() {
  const { t } = useTranslation();

  const classes = useStyles();
  const { onErrorMsg } = useAlert();

  const { data: kibanaUrlGraphql } =
    useQuery<KibanaUrlGraphql>(QUERY_KIBANA_URL);
  const [kibanaUrl, setKibanaUrl] = useState<KibanaUrlString>();

  useEffect(() => {
    (async function runAsync() {
      const kibanaData = kibanaUrlGraphql?.getKibanaUrl;
      // 因为 graphql 的 hook 会导致登录两次
      if (!kibanaUrl && kibanaData && kibanaData?.kibanaUrl) {
        const tempKibanaUrl = JSON.parse(
          kibanaData.kibanaUrl
        ) as KibanaUrlString;

        const kibanaLoginUrl = clientConfig.kibana.loginUrl;
        const currentUrl = getKibanaSpaceUrl(tempKibanaUrl.spaceId);

        try {
          await axios.get<void>(currentUrl);
        } catch (ex) {
          // 需要登陆
          const kibanaLoginBody = {
            providerType: 'basic',
            providerName: 'basic',
            currentURL: currentUrl,
            params: {
              username: kibanaData?.kibanaUsername,
              password: kibanaData?.kibanaPassword,
            },
          };
          const result = await axios.post<void>(
            kibanaLoginUrl,
            kibanaLoginBody,
            {
              headers: {
                'Content-Type': 'application/json',
                'kbn-version': '7.16.1',
                'kbn-xsrf': true,
              },
            }
          );
          if (result.status !== 200) {
            onErrorMsg(
              'Failed to log in to Kibana, please contact the administrator'
            );
          }
        } finally {
          setKibanaUrl(tempKibanaUrl);
        }
      }
    })();
  }, [kibanaUrl, kibanaUrlGraphql, onErrorMsg]);

  const { data, refetch } = useQuery<RealTimeStatisticsGraphql>(
    QUERY_REALTIME_STATISTICS,
    {
      fetchPolicy: 'no-cache',
    }
  );

  const realTimeStatistics =
    data?.realTimeStatistics ?? defaultRealTimeStatistics;

  useEffect(() => {
    const tempSubscription: Subscription = interval(5000).subscribe(() => {
      refetch();
    });
    return () => {
      if (tempSubscription) {
        tempSubscription.unsubscribe();
      }
    };
  }, [refetch]);

  const tempActions = [
    {
      icon: <TabIcon />,
      name: t('Open in new window'),
      doAction: () => {
        if (kibanaUrl) {
          window.open(
            getDashboardUrlById(kibanaUrl.spaceId, kibanaUrl.conv),
            '_blank',
            'electron:true'
          );
        }
      },
    },
  ];

  return (
    <div>
      <SpeedDials actions={tempActions} />
      <GridContainer>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                {/* <Icon>content_copy</Icon> */}
                <HeadsetMicIcon />
              </CardIcon>
              <p className={classes.cardCategory}>{t('Online staff')}</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.onlineStaffCount}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Danger>
                  <SyncIcon />
                </Danger>
                <a href="#pablo" onClick={(e) => e.preventDefault()}>
                  {t('Refresh in real time')}
                </a>
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="warning" stats icon>
              <CardIcon color="warning">
                <RemoveCircleIcon />
              </CardIcon>
              <p className={classes.cardCategory}>{t('Busy/Away staff')}</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.busyStaffCount}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer />
                {t('In the current online staff, leave and busy number')}
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                {/* <Icon>info_outline</Icon> */}
                <QuestionAnswerIcon />
              </CardIcon>
              <p className={classes.cardCategory}>{t('Sessions count')}</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.onlineCustomerCount}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer />
                {t('Number of sessions currently in progress')}
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="danger" stats icon>
              <CardIcon color="danger">
                <Icon icon={peopleQueue24Filled} />
              </CardIcon>
              <p className={classes.cardCategory}>{t('Number of queues')}</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.queueCount
                  ?.map((it) => it.count)
                  .reduce((it, ft) => it + ft, 0)}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <InfoIcon />
                {t('Number of customers in queue')}
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem
          xs={12}
          sm={12}
          style={{
            display: 'flex',
            width: '100%',
            height: 'calc(100vh - 60px)',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {kibanaUrl && (
            <iframe
              title={t('Monitoring')}
              style={{
                flexGrow: 1,
                border: 'none',
                margin: 0,
                padding: 0,
              }}
              src={getDashboardUrlById(kibanaUrl.spaceId, kibanaUrl.conv)}
            />
          )}
        </GridItem>
      </GridContainer>
    </div>
  );
}
