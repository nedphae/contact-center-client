/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import SwipeableViews from 'react-swipeable-views';
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ChatIcon from '@material-ui/icons/Chat';
import HistoryIcon from '@material-ui/icons/History';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';

import Authorized from 'renderer/utils/Authorized';
import check from 'renderer/components/Authorized/CheckPermissions';
import SessionList from './SessionList';
import Monitor from './Monitor';
import TabPanel from '../Base/TabPanel';
// import Monitor from './Monitor';

function a11yProps(index: number) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
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
  const theme = useTheme();

  const tabCount = check('admin', 3, 2);
  const style = {
    minWidth: `calc(100% / ${tabCount})`,
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
    <div className={classes.root}>
      <Authorized
        authority={['admin']}
        noMatch={
          <>
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
            </Tabs>
            <SwipeableViews
              axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
              index={value}
              onChangeIndex={handleChangeIndex}
            >
              <TabPanel value={value} index={0}>
                <SessionList />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <SessionList history />
              </TabPanel>
              <TabPanel value={value} index={2}>
                {/* 添加权限的Dom */}
                <Monitor refreshInterval={2000} />
              </TabPanel>
            </SwipeableViews>
          </>
        }
      >
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
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0}>
            <SessionList />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <SessionList history />
          </TabPanel>
          <TabPanel value={value} index={2}>
            {/* 添加权限的Dom */}
            <Monitor refreshInterval={2000} />
          </TabPanel>
        </SwipeableViews>
      </Authorized>
    </div>
  );
}
