import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import { getSelectedMessageList } from 'app/state/session/sessionAction';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    text: {
      padding: theme.spacing(2, 2, 0),
    },
    paper: {
      // paddingBottom: 50,
      maxHeight: '100%',
      overflow: 'auto',
    },
    messagePaper: {
      padding: 7,
      maxWidth: '90%',
      borderRadius: 10,
      // 如果是收到的消息就是 borderTopLeftRadius
      borderTopRightRadius: 0,
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

const MessageList = () => {
  const classes = useStyles();
  const refOfPaper = useRef<Element>();
  const messages = useSelector(getSelectedMessageList());

  // 如果有问题 修改 userEffect 为 useLayoutEffect
  useEffect(() => {
    if (refOfPaper.current !== undefined) {
      refOfPaper.current.scrollTop = refOfPaper.current?.scrollHeight;
    }
  });

  return (
    <Paper square className={classes.paper} ref={refOfPaper}>
      <Typography className={classes.text} variant="h5" gutterBottom>
        收件箱
      </Typography>
      <List className={classes.list}>
        {messages.map(({ uuid, nickName, createdAt, content }) => (
          <React.Fragment key={uuid}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar className={classes.listItemAvatar}>
                <Avatar alt="Profile Picture" />
              </ListItemAvatar>
              {/* justify="flex-end" 如果是收到的消息就不设置这个 */}
              <Grid container justify="flex-end">
                <Grid item xs={12}>
                  <ListItemText
                    primary={
                      <Grid container alignItems="center" justify="flex-end">
                        {/* justify="flex-end" */}
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          className={classes.inline}
                        >
                          {nickName}
                        </Typography>
                        <Typography
                          variant="body2"
                          gutterBottom
                          className={classes.inline}
                        >
                          {createdAt}
                        </Typography>
                      </Grid>
                    }
                  />
                </Grid>
                <Paper elevation={4} className={classes.messagePaper}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        gutterBottom
                        className={classes.message}
                      >
                        {content.textContent?.text}
                      </Typography>
                    }
                  />
                </Paper>
              </Grid>
              <ListItemAvatar className={classes.listItemAvatar}>
                <Avatar alt="Profile Picture" />
              </ListItemAvatar>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default MessageList;
