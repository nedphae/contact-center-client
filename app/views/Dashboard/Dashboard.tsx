import React, { useEffect, useState } from 'react';
import axios from 'axios';
// react plugin for creating charts
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
// @material-ui/icons
import Store from '@material-ui/icons/Store';
import Warning from '@material-ui/icons/Warning';
import DateRange from '@material-ui/icons/DateRange';
import LocalOffer from '@material-ui/icons/LocalOffer';
import Update from '@material-ui/icons/Update';
import Accessibility from '@material-ui/icons/Accessibility';
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

export default function Dashboard() {
  const classes = useStyles();
  const { onErrorMsg } = useAlert();

  const { data: kibanaUrlGraphql } =
    useQuery<KibanaUrlGraphql>(QUERY_KIBANA_URL);
  const [kibanaUrl, setKibanaUrl] = useState<string>();

  useEffect(() => {
    (async function runAsync() {
      const kibanaData = kibanaUrlGraphql?.getKibanaUrl;
      if (kibanaData && kibanaData?.kibanaUrl) {
        const kibanaLoginUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://xbcs.top:5601/internal/security/login'
            : 'http://192.168.50.105:5601/internal/security/login';
        const currentUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://xbcs.top:5601/login'
            : 'http://192.168.50.105:5601/login';
        const kibanaLoginBody = {
          providerType: 'basic',
          providerName: 'basic',
          currentURL: currentUrl,
          params: {
            username: kibanaData?.kibanaUsername,
            password: kibanaData?.kibanaPassword,
          },
        };
        const result = await axios.post<void>(kibanaLoginUrl, kibanaLoginBody, {
          headers: {
            'Content-Type': 'application/json',
            'kbn-version': '7.16.1',
          },
        });
        if (result.status !== 200) {
          onErrorMsg('登录Kibana失败，请联系管理员');
        }
        setKibanaUrl(kibanaData?.kibanaUrl);
      }
    })();
  }, [kibanaUrlGraphql, onErrorMsg]);

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
            <CardHeader color="warning" stats icon>
              <CardIcon color="warning">
                <Icon>content_copy</Icon>
              </CardIcon>
              <p className={classes.cardCategory}>在线客服</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.onlineStaffCount}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <Danger>
                  <Warning />
                </Danger>
                <a href="#pablo" onClick={(e) => e.preventDefault()}>
                  Get more space
                </a>
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                <Store />
              </CardIcon>
              <p className={classes.cardCategory}>忙碌/离开客服</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.busyStaffCount}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <DateRange />
                Last 24 Hours
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="danger" stats icon>
              <CardIcon color="danger">
                <Icon>info_outline</Icon>
              </CardIcon>
              <p className={classes.cardCategory}>当前咨询量</p>
              <h3 className={classes.cardTitle}>
                {realTimeStatistics.onlineCustomerCount}
              </h3>
            </CardHeader>
            <CardFooter stats>
              <div className={classes.stats}>
                <LocalOffer />
                Tracked from Github
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                <Accessibility />
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
                <Update />
                Just Updated
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12}>
          {kibanaUrl && (
            <iframe
              title="监控"
              width="100%"
              height={document.documentElement.clientHeight - 60}
              src={kibanaUrl}
            />
          )}
        </GridItem>
      </GridContainer>
    </div>
  );
}
