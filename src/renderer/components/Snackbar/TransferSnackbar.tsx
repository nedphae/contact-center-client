import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import {
  getFirstTransferMessageRecive,
  removeTransferMessageRecive,
} from 'renderer/state/chat/chatAction';
import {
  Avatar,
  Button,
  CardContent,
  DialogActions,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import { TransferMessageResponse } from 'renderer/domain/Conversation';
import { useLazyQuery } from '@apollo/client';
import {
  CustomerGraphql,
  QUERY_CUSTOMER,
} from 'renderer/domain/graphql/Customer';
import { StaffGraphql, QUERY_STAFF_BY_ID } from 'renderer/domain/graphql/Staff';
import { getDownloadS3StaffImgPath } from 'renderer/config/clientConfig';
import { sendTransferResponseMsg } from 'renderer/state/session/sessionAction';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  inline: {
    display: 'inline',
  },
}));

export default function TransferSnackbar() {
  const classes = useStyles();
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const [reason, setReason] = useState<string>();
  const lastRequest = useSelector(getFirstTransferMessageRecive);
  const [getStaff, { data: staff }] =
    useLazyQuery<StaffGraphql>(QUERY_STAFF_BY_ID);
  const [getCustomer, { data: customer }] =
    useLazyQuery<CustomerGraphql>(QUERY_CUSTOMER);

  useEffect(() => {
    if (lastRequest) {
      getStaff({ variables: { staffId: lastRequest.fromStaffId } });
      getCustomer({ variables: { userId: lastRequest.userId } });
    }
  }, [getCustomer, getStaff, lastRequest]);

  const acceptTransfer = () => {
    if (lastRequest) {
      const { userId, fromStaffId, toStaffId } = lastRequest;
      const response: TransferMessageResponse = {
        userId,
        fromStaffId,
        toStaffId,
        accept: true,
      };
      dispatch(sendTransferResponseMsg(response));
      dispatch(removeTransferMessageRecive(userId));
    }
  };

  const refuseTransfer = () => {
    if (lastRequest) {
      const { userId, fromStaffId, toStaffId } = lastRequest;
      const response: TransferMessageResponse = {
        userId,
        fromStaffId,
        toStaffId,
        accept: false,
        reason,
      };
      dispatch(sendTransferResponseMsg(response));
      dispatch(removeTransferMessageRecive(userId));
      setReason('');
    }
  };

  return (
    <>
      {lastRequest && staff && customer && (
        <div className={classes.root}>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open
          >
            <>
              <Paper>
                <CardContent>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        alt={staff.getStaffById.realName}
                        src={
                          staff.getStaffById.avatar
                            ? `${getDownloadS3StaffImgPath()}${
                                staff.getStaffById.avatar
                              }`
                            : undefined
                        }
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${t('Staff')}: ${
                        staff.getStaffById.realName
                      } ${t('request transfer user')}: ${
                        customer.getCustomer.name
                      }`}
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          className={classes.inline}
                          color="secondary"
                        >
                          {`${t('Remarks')}: ${lastRequest.remarks}`}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem alignItems="flex-start">
                    <TextField
                      id="outlined-basic"
                      label={t('Reason for refusal')}
                      variant="outlined"
                      fullWidth
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </ListItem>
                </CardContent>
                <DialogActions>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={refuseTransfer}
                  >
                    {t('Refuse')}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={acceptTransfer}
                  >
                    {t('Approve')}
                  </Button>
                </DialogActions>
              </Paper>
            </>
          </Snackbar>
        </div>
      )}
    </>
  );
}
