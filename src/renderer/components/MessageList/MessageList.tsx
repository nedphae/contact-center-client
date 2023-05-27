import React, { useState } from 'react';

import { useQuery } from '@apollo/client';

import Viewer from 'react-viewer';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import { getDownloadS3StaffImgPath } from 'renderer/config/clientConfig';
import { Conversation } from 'renderer/domain/Conversation';
import { CreatorType } from 'renderer/domain/constant/Message';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { StaffGraphql, QUERY_STAFF_BY_ID } from 'renderer/domain/graphql/Staff';
import {
  createContent,
  useMessageListStyles,
} from '../Chat/ChatBox/MessageList';

interface MessageListProps {
  conversation: Conversation;
}

export default function MessageList(props: MessageListProps) {
  const { conversation } = props;
  const classes = useMessageListStyles();
  const [showImageViewerDialog, toggleShowImageViewerDialog] = useState(false);
  const [imageViewer, setImageViewer] = useState<ImageDecorator>({
    src: '',
    alt: undefined,
  });
  const { data } = useQuery<StaffGraphql>(QUERY_STAFF_BY_ID, {
    variables: { staffId: conversation.staffId },
  });

  const staff = data?.getStaffById;

  const messages = [...(conversation.chatMessages ?? [])].sort(
    (a, b) =>
      // 默认 seqId 为最大
      (a.seqId ?? Number.MAX_SAFE_INTEGER) -
      (b.seqId ?? Number.MAX_SAFE_INTEGER)
  );

  function openImageViewer(src: string, alt: string) {
    setImageViewer({ src, alt });
    toggleShowImageViewerDialog(true);
  }

  const closeImageViewerDialog = () => {
    toggleShowImageViewerDialog(false);
  };

  return (
    <Paper
      square
      className={classes.paper}
      style={{ overflowY: 'auto', height: 'calc(100vh - 220px)' }}
    >
      <List className={classes.list}>
        {messages.map((message) => {
          const { uuid, createdAt, content, creatorType } = message;
          return (
            <React.Fragment key={uuid}>
              <ListItem alignItems="flex-start">
                {/* 客户的消息的头像 */}
                {creatorType === CreatorType.CUSTOMER && (
                  <ListItemAvatar className={classes.listItemAvatar}>
                    <Avatar alt="Profile Picture" />
                  </ListItemAvatar>
                )}
                {/* justifyContent="flex-end" 如果是收到的消息就不设置这个 */}
                <Grid
                  container
                  justifyContent={
                    creatorType === CreatorType.CUSTOMER
                      ? 'flex-start'
                      : 'flex-end'
                  }
                >
                  <Grid item xs={12}>
                    <ListItemText
                      primary={
                        <Grid
                          container
                          alignItems="center"
                          justifyContent={
                            creatorType === CreatorType.CUSTOMER
                              ? 'flex-start'
                              : 'flex-end'
                          }
                        >
                          {/* justifyContent="flex-end" */}
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            className={classes.inline}
                          >
                            {creatorType === CreatorType.CUSTOMER
                              ? conversation.userName
                              : conversation.nickname}
                          </Typography>
                          <Typography
                            variant="body2"
                            gutterBottom
                            className={classes.inline}
                          >
                            {createdAt && javaInstant2DateStr(createdAt)}
                          </Typography>
                        </Grid>
                      }
                    />
                  </Grid>
                  <Paper
                    elevation={4}
                    className={clsx(
                      creatorType === CreatorType.CUSTOMER
                        ? classes.fromMessagePaper
                        : classes.toMessagePaper,
                      classes.baseMessagePaper
                    )}
                  >
                    {createContent(message, classes, openImageViewer)}
                  </Paper>
                </Grid>
                {/* 客服发送的消息的头像 */}
                {creatorType === CreatorType.STAFF && (
                  <ListItemAvatar className={classes.listItemAvatar}>
                    <Avatar
                      src={
                        staff &&
                        staff.avatar &&
                        `${getDownloadS3StaffImgPath()}${staff.avatar}`
                      }
                    />
                  </ListItemAvatar>
                )}
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
      <Viewer
        visible={showImageViewerDialog}
        onClose={closeImageViewerDialog}
        images={[imageViewer]}
        zIndex={2000}
      />
    </Paper>
  );
}
