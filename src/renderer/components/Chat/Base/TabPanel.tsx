/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core';

interface TabPanelProps {
  children: React.ReactNode | undefined;
  index: number;
  value: number;
  className?: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    list: {
      overflow: 'auto',
      height: 'calc(100vh - 118px)',
    },
  })
);

export default function TabPanel(props: TabPanelProps) {
  const { children, value, index, className, ...other } = props;
  const defaultClasses = useStyles();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      className={className ?? defaultClasses.list}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

TabPanel.defaultProps = {
  className: undefined,
};
