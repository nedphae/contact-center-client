import React from 'react';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import { Message } from 'app/domain/Message';
import {
  createContent,
  useMessageListStyles,
} from '../Chat/ChatBox/MessageList';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList(props: MessageListProps) {
  const { messages } = props;
  const classes = useMessageListStyles();

  return (
    <Paper square className={classes.paper}>
      <List className={classes.list}>
        {messages.map(({ uuid, createdAt, content, from, to }) => (
          <React.Fragment key={uuid}>
            <ListItem alignItems="flex-start">
              {/* 接受到的消息的头像 */}
              {from !== undefined && (
                <ListItemAvatar className={classes.listItemAvatar}>
                  <Avatar alt="Profile Picture" />
                </ListItemAvatar>
              )}
              {/* justify="flex-end" 如果是收到的消息就不设置这个 */}
              <Grid
                container
                justify={from !== undefined ? 'flex-start' : 'flex-end'}
              >
                <Grid item xs={12}>
                  <ListItemText
                    primary={
                      <Grid
                        container
                        alignItems="center"
                        justify={from !== undefined ? 'flex-start' : 'flex-end'}
                      >
                        {/* justify="flex-end" */}
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          className={classes.inline}
                        >
                          {from !== undefined ? user.name : staff.nickName}
                        </Typography>
                        <Typography
                          variant="body2"
                          gutterBottom
                          className={classes.inline}
                        >
                          {createdAt?.toString()}
                        </Typography>
                      </Grid>
                    }
                  />
                </Grid>
                <Paper
                  elevation={4}
                  className={
                    from !== undefined
                      ? classes.fromMessagePaper
                      : classes.toMessagePaper
                  }
                >
                  {createContent(content, classes)}
                </Paper>
              </Grid>
              {/* 发送的消息的头像 */}
              {to !== undefined && (
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
