/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';

import { useSelector } from 'react-redux';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import {
  getSnackbarProp,
  setSnackbarProp,
} from 'renderer/state/chat/chatAction';
import { CircularProgress } from '@material-ui/core';
import { SnackbarProp } from 'renderer/domain/Chat';
import { useAppDispatch } from 'renderer/store';

export function Alert(props: JSX.IntrinsicAttributes & AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

function getBySnackbarProp(
  t: TFunction<'notification', undefined>,
  snackbarProp: SnackbarProp,
  onClose?: (event: React.SyntheticEvent) => void
) {
  if (snackbarProp.loadding) {
    return <CircularProgress color="secondary" />;
  }
  return (
    <Alert onClose={onClose} severity={snackbarProp.severity}>
      {!!snackbarProp.message && t(snackbarProp.message)}
    </Alert>
  );
}

export default function DefaultSnackbar() {
  const classes = useStyles();
  const snackbarProp = useSelector(getSnackbarProp);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleClose = (
    _event: React.SyntheticEvent<Element, Event>,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(setSnackbarProp(undefined));
  };

  return (
    <>
      {snackbarProp && (
        <div className={classes.root}>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={snackbarProp.open}
            autoHideDuration={snackbarProp.autoHideDuration}
            onClose={handleClose}
          >
            {getBySnackbarProp(t, snackbarProp, handleClose)}
          </Snackbar>
        </div>
      )}
    </>
  );
}
