/* eslint-disable react/jsx-props-no-spreading */
/**
 * TODO: 客户信息 等的组件开发
 */
import React, { useState } from 'react';

import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import ComingSoon from 'app/components/ComingSoon/ComingSoon';
import Style from './DetailCard.less';
import CustomerInfo from './panel/CustomerInfo';
import QuickReply from './panel/QuickReply/QuickReply';
import ConvsationHistory from './panel/ConvsationHistory';
import TabPanel from '../Base/TabPanel';

function a11yProps(index: number) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

export default function DetailCard() {
  const theme = useTheme();
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

  return (
    <div className={Style.container}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable prevent tabs example"
      >
        <Tab style={style} label="客户信息" {...a11yProps(0)} />
        <Tab style={style} label="历史会话" {...a11yProps(1)} />
        <Tab style={style} label="常用话术" {...a11yProps(2)} />
        <Tab style={style} label="ERP" {...a11yProps(3)} />
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
          <ConvsationHistory />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <QuickReply />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ComingSoon />
        </TabPanel>
      </SwipeableViews>
    </div>
  );
}
