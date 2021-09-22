import React from 'react';

import { useSelector } from 'react-redux';

import { makeStyles, Theme, createStyles } from '@material-ui/core';

import { getMyself } from 'app/state/staff/staffAction';
import StaffForm from 'app/components/StaffForm/StaffForm';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
  })
);

export default function Account() {
  const classes = useStyles();
  const mySelf = useSelector(getMyself);

  return (
    <div className={classes.root}>
      <StaffForm defaultValues={mySelf} />
    </div>
  );
}
