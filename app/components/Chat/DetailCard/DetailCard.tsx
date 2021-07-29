/* eslint-disable react/jsx-props-no-spreading */
/**
 * TODO: 客户信息 等的组件开发
 */
import React, { useState } from 'react';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import Style from './DetailCard.less';
import CustomerInfo from './panel/CustomerInfo';
import QuickReply from './panel/QuickReply/QuickReply';

function a11yProps(index: number) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children: React.ReactNode | undefined;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="span">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function DetailCard() {
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
      <TabPanel value={value} index={0}>
        <CustomerInfo />
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        <QuickReply />
      </TabPanel>
      <TabPanel value={value} index={3}>
        Item Three
      </TabPanel>
    </div>
  );
}
