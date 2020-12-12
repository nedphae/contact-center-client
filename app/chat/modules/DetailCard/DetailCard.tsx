/* eslint-disable react/jsx-props-no-spreading */
/**
 * TODO: 后续将 tabs 组件化
 */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ChatIcon from '@material-ui/icons/Chat';
import HistoryIcon from '@material-ui/icons/History';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';

import useAero from 'app/chat/hooks/useAero';
import Style from './DetailCard.less';

function a11yProps(index: any) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
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
  const aero = useAero();
  const style = {
    minWidth: 'calc(100% / 3)',
  };
  const handleChange = (event: React.ChangeEvent, newValue: number) => {
    setValue(newValue);
    event.preventDefault();
  };
  return (
    <div className={Style.container} {...aero}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="off"
        aria-label="scrollable prevent tabs example"
      >
        <Tab
          style={style}
          icon={<ChatIcon />}
          aria-label="phone"
          {...a11yProps(0)}
        />
        <Tab
          style={style}
          icon={<HistoryIcon />}
          aria-label="favorite"
          {...a11yProps(1)}
        />
        <Tab
          style={style}
          icon={<PeopleAltIcon />}
          aria-label="person"
          {...a11yProps(2)}
        />
      </Tabs>
      <TabPanel value={value} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
    </div>
  );
}
