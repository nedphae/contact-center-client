import React, { useEffect, useRef } from 'react';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import { Content, Message } from 'app/domain/Message';
import Staff from 'app/domain/StaffInfo';
import { Customer } from 'app/domain/Customer';
import javaInstant2DateStr from 'app/utils/timeUtils';
import FileCard from './FileCard';

export const useMessageListStyles = makeStyles((theme: Theme) =>
  createStyles({
    text: {
      padding: theme.spacing(2, 2, 0),
    },
    paper: {
      // paddingBottom: 50,
      maxHeight: '100%',
      width: '100%',
      overflow: 'auto',
    },
    toMessagePaper: {
      padding: 7,
      maxWidth: '90%',
      borderRadius: 10,
      // 如果是收到的消息就是 borderTopLeftRadius
      borderTopRightRadius: 0,
    },
    fromMessagePaper: {
      padding: 7,
      maxWidth: '90%',
      borderRadius: 10,
      // 如果是收到的消息就是 borderTopLeftRadius
      borderTopLeftRadius: 0,
    },
    listItemAvatar: {
      marginBottom: 0,
      padding: 8,
      minWidth: 0,
    },
    list: {
      marginBottom: theme.spacing(2),
    },
    subheader: {
      backgroundColor: theme.palette.background.paper,
    },
    appBar: {
      top: 'auto',
      bottom: 0,
    },
    grow: {
      flexGrow: 1,
    },
    fabButton: {
      position: 'absolute',
      zIndex: 1,
      top: -30,
      left: 0,
      right: 0,
      margin: '0 auto',
    },
    inline: {
      display: 'inline',
      padding: 2,
    },
    message: {
      userSelect: 'text',
    },
  })
);

export function createContent(
  content: Content,
  classes: ClassNameMap<'message'>
) {
  let element;
  switch (content.contentType) {
    case 'SYS': {
      break;
    }
    case 'TEXT': {
      const text = content.textContent?.text;
      element = (
        <ListItemText
          primary={
            <Typography
              variant="body1"
              gutterBottom
              className={classes.message}
            >
              {text}
            </Typography>
          }
        />
      );
      break;
    }
    case 'IMAGE': {
      const imageUrl = content.photoContent?.mediaId;
      const filename = content.photoContent?.filename;
      element = <img src={imageUrl} alt={filename} />;
      break;
    }
    case 'VOICE': {
      // TODO: 生成音频
      break;
    }
    case 'FILE': {
      if (content.attachments !== undefined) {
        const { filename, size, url } = content.attachments;
        element = <FileCard filename={filename} fileSize={size} url={url} />;
      }
      break;
    }
    case 'LINK': {
      break;
    }
    default: {
      break;
    }
  }
  return element;
}

interface MessageListProps {
  messages: Message[];
  staff: Staff;
  user: Customer | undefined | null;
}

const MessageList = (props: MessageListProps) => {
  const { messages, staff, user } = props;
  const classes = useMessageListStyles();
  const refOfPaper = useRef<Element>();

  // 如果有问题 修改 userEffect 为 useLayoutEffect
  useEffect(() => {
    if (refOfPaper.current !== undefined) {
      refOfPaper.current.scrollTop = refOfPaper.current?.scrollHeight;
    }
  }, [messages]);

  return (
    <Paper square className={classes.paper} ref={refOfPaper}>
      <List className={classes.list}>
        {user &&
          messages &&
          messages.map(({ uuid, createdAt, content, from, to }) => (
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
                          justify={
                            from !== undefined ? 'flex-start' : 'flex-end'
                          }
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
                            {createdAt && javaInstant2DateStr(createdAt)}
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
};

export default MessageList;
