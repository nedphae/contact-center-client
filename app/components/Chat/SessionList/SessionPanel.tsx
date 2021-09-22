/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ChatIcon from '@material-ui/icons/Chat';
import HistoryIcon from '@material-ui/icons/History';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import Box from '@material-ui/core/Box';

import Authorized from 'app/utils/Authorized';
import SessionList from './SessionList';
import Monitor from './Monitor';
// import Monitor from './Monitor';

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
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%', // '100%', 联系人列表的宽度
    height: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function SessionPanel() {
  const [value, setValue] = useState(0);
  const classes = useStyles();

  const style = {
    minWidth: 'calc(100% / 3)',
  };

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: number
  ) => {
    setValue(newValue);
    event.preventDefault();
  };

  return (
    <div className={classes.root}>
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
          aria-label="chat"
          {...a11yProps(0)}
        />
        <Tab
          style={style}
          icon={<HistoryIcon />}
          aria-label="history"
          {...a11yProps(1)}
        />
        <Tab
          style={style}
          icon={<PeopleAltIcon />}
          aria-label="colleague"
          {...a11yProps(2)}
        />
      </Tabs>
      <TabPanel value={value} index={0}>
        <SessionList />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SessionList history />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Authorized authority={['admin']} noMatch="非 Admin权限">
          {/* 添加权限的Dom */}
          <Monitor refreshInterval={2000} />
        </Authorized>
      </TabPanel>
    </div>
  );
}
