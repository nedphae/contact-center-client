/* eslint-disable react/jsx-props-no-spreading */
/**
 * TODO: 客户信息 等的组件开发
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import classNames from 'classnames';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

// import ComingSoon from 'renderer/components/ComingSoon/ComingSoon';
import Style from './DetailCard.less';
import CustomerInfo from './panel/CustomerInfo';
import QuickReply from './panel/QuickReply/QuickReply';
import ConvsationHistory from './panel/ConvsationHistory';
import TabPanel from '../Base/TabPanel';
import Erp from './panel/Erp';
import UserTrackContainer from './panel/UserTrackContainer';

function a11yProps(index: number) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

export default function DetailCard() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [value, setValue] = useState(0);
  const style = {
    minWidth: 'calc(100% / 4)',
  };

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: number
  ) => {
    setValue(newValue);
    event.preventDefault();
  };
  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  const backgroundColor = {
    backgroundColor: theme.palette.background.paper,
  };

  return (
    <div className={classNames(Style.container)} style={backgroundColor}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable prevent tabs example"
      >
        <Tab style={style} label={t('Information')} {...a11yProps(0)} />
        <Tab style={style} label={t('Track')} {...a11yProps(1)} />
        <Tab style={style} label={t('History')} {...a11yProps(2)} />
        <Tab style={style} label={t('Quick Reply')} {...a11yProps(3)} />
        <Tab style={style} label={t('ERP')} {...a11yProps(4)} />
        {/* TODO: 后面可以做成配置型的 */}
      </Tabs>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0}>
          <CustomerInfo />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <UserTrackContainer />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ConvsationHistory />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <QuickReply />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Erp />
        </TabPanel>
      </SwipeableViews>
    </div>
  );
}
