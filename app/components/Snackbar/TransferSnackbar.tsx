import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import {
  getFirstTransferMessageRecive,
  removeTransferMessageRecive,
} from 'app/state/chat/chatAction';
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
import { TransferMessageResponse } from 'app/domain/Conversation';
import { useLazyQuery } from '@apollo/client';
import { CustomerGraphql, QUERY_CUSTOMER } from 'app/domain/graphql/Customer';
import { StaffGraphql, QUERY_STAFF_BY_ID } from 'app/domain/graphql/Staff';
import { getDownloadS3StaffImgPath } from 'app/config/clientConfig';
import { sendTransferResponseMsg } from 'app/state/session/sessionAction';

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
                      primary={`客服: ${staff.getStaffById.realName} 请求转接用户: ${customer.getCustomer.name}`}
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          className={classes.inline}
                          color="secondary"
                        >
                          {`备注: ${lastRequest.remarks}`}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem alignItems="flex-start">
                    <TextField
                      id="outlined-basic"
                      label="拒绝理由"
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
                    拒绝
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={acceptTransfer}
                  >
                    同意
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
