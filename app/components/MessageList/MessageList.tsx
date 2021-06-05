import React from 'react';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import { Conversation } from 'app/domain/Conversation';
import { CreatorType } from 'app/domain/constant/Message';
import javaInstant2Date from 'app/utils/timeUtils';
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
  const messages = (conversation.chatMessages
    ? conversation.chatMessages
    : []
  ).sort(
    (a, b) =>
      // 默认 seqId 为最大
      (a.seqId ?? Number.MAX_SAFE_INTEGER) -
      (b.seqId ?? Number.MAX_SAFE_INTEGER)
  );

  return (
    <Paper square className={classes.paper}>
      <List className={classes.list}>
        {messages.map(({ uuid, createdAt, content, creatorType }) => (
          <React.Fragment key={uuid}>
            <ListItem alignItems="flex-start">
              {/* 客户的消息的头像 */}
              {creatorType === CreatorType.CUSTOMER && (
                <ListItemAvatar className={classes.listItemAvatar}>
                  <Avatar alt="Profile Picture" />
                </ListItemAvatar>
              )}
              {/* justify="flex-end" 如果是收到的消息就不设置这个 */}
              <Grid
                container
                justify={
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
                        justify={
                          creatorType === CreatorType.CUSTOMER
                            ? 'flex-start'
                            : 'flex-end'
                        }
                      >
                        {/* justify="flex-end" */}
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          className={classes.inline}
                        >
                          {creatorType === CreatorType.CUSTOMER
                            ? conversation.userName
                            : conversation.nickName}
                        </Typography>
                        <Typography
                          variant="body2"
                          gutterBottom
                          className={classes.inline}
                        >
                          {createdAt && javaInstant2Date(createdAt)}
                        </Typography>
                      </Grid>
                    }
                  />
                </Grid>
                <Paper
                  elevation={4}
                  className={
                    creatorType === CreatorType.CUSTOMER
                      ? classes.fromMessagePaper
                      : classes.toMessagePaper
                  }
                >
                  {createContent(content, classes)}
                </Paper>
              </Grid>
              {/* 客服发送的消息的头像 */}
              {creatorType === CreatorType.STAFF && (
                <ListItemAvatar className={classes.listItemAvatar}>
                  <Avatar alt="Profile Picture" />
                </ListItemAvatar>
              )}
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}
