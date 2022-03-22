import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { makeStyles, Theme, createStyles } from '@material-ui/core';

import { getMyself, setStaff } from 'app/state/staff/staffAction';
import StaffForm from 'app/components/StaffForm/StaffForm';
import Staff from 'app/domain/StaffInfo';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
  })
);

export default function Account() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const mySelf = useSelector(getMyself);

  function mutationCallback(staff: Staff) {
    dispatch(setStaff(staff));
  }
  return (
    <div className={classes.root}>
      <StaffForm defaultValues={mySelf} mutationCallback={mutationCallback} />
    </div>
  );
}
