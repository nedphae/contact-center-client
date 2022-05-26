import React, { useEffect, useState } from 'react';
import axios from 'axios';
// react plugin for creating charts
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';
// @material-ui/icons
import Store from '@material-ui/icons/Store';
import SyncIcon from '@material-ui/icons/Sync';
import { Icon } from '@iconify/react';
import peopleQueue24Filled from '@iconify/icons-fluent/people-queue-24-filled';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import InfoIcon from '@material-ui/icons/Info';
import Warning from '@material-ui/icons/Warning';
import DateRange from '@material-ui/icons/DateRange';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import LocalOffer from '@material-ui/icons/LocalOffer';
import Update from '@material-ui/icons/Update';
import Accessibility from '@material-ui/icons/Accessibility';
import HeadsetMicIcon from '@material-ui/icons/HeadsetMic';
// core components
import { gql, useQuery } from '@apollo/client';
import {
  RealTimeStatisticsGraphql,
  QUERY_REALTIME_STATISTICS,
} from 'app/domain/graphql/RealTimeStatistics';
import { defaultRealTimeStatistics } from 'app/domain/RealTimeStatistics';
import { interval, Subscription } from 'rxjs';
import useAlert from 'app/hook/alert/useAlert';
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
  conv: string;
  staff: string;
}

export default function Dashboard() {
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
        const kibanaLoginUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://xbcs.top:5601/internal/security/login'
            : 'http://192.168.50.105:5601/internal/security/login';
        const currentUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://xbcs.top:5601/api/spaces/space/default'
            : 'http://192.168.50.105:5601/api/spaces/space/default';

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
              },
            }
          );
          if (result.status !== 200) {
            onErrorMsg('登录Kibana失败，请联系管理员');
          }
        } finally {
          setKibanaUrl(JSON.parse(kibanaData?.kibanaUrl));
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

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                {/* <Icon>content_copy</Icon> */}
                <HeadsetMicIcon />
              </CardIcon>
              <p className={classes.cardCategory}>在线客服</p>
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
                  实时刷新在线客服数量
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
              <p className={classes.cardCategory}>忙碌/离开客服</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.busyStaffCount}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer />
                当前在线客服中，设置了离开和忙碌的客服
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
              <p className={classes.cardCategory}>当前咨询量</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.onlineCustomerCount}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer />
                当前进行中的会话数量
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
              <p className={classes.cardCategory}>排队数量</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.queueCount
                  ?.map((it) => it.count)
                  .reduce((it, ft) => it + ft, 0)}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <InfoIcon />
                正在排队的客户数量
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
              title="监控"
              style={{
                flexGrow: 1,
                border: 'none',
                margin: 0,
                padding: 0,
              }}
              src={kibanaUrl.conv}
            />
          )}
        </GridItem>
      </GridContainer>
    </div>
  );
}
