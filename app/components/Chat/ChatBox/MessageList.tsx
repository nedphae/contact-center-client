import React, { useEffect, useRef, useState } from 'react';

import _ from 'lodash';

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
import { gql, useLazyQuery } from '@apollo/client';
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
  loadMore?: boolean;
}

const CONTENT_QUERY = gql`
  fragment MyMessageContent on Message {
    content {
      content {
        contentType
        sysCode
        attachments {
          mediaId
          size
          type
          url
        }
        photoContent {
          mediaId
          filename
          picSize
          type
        }
        textContent {
          text
        }
      }
      conversationId
      createdAt
      creatorType
      from
      nickName
      organizationId
      seqId
      to
      type
      uuid
    }
  }
`;

const QUERY = gql`
  ${CONTENT_QUERY}
  query HistoryMessage($userId: Long!, $lastSeqId: Long, $pageSize: Int) {
    loadHistoryMessage(
      userId: $userId
      lastSeqId: $lastSeqId
      pageSize: $pageSize
    ) {
      ...MyMessageContent
    }
  }
`;
interface MessagePage {
  loadHistoryMessage: Message[];
}

const MessageList = (props: MessageListProps) => {
  const { messages, staff, user, loadMore } = props;
  const classes = useMessageListStyles();
  const refOfPaper = useRef<Element>();
  const [lastSeqId, setLastSeqId] = useState<number | undefined>();
  const [loadHistoryMessage, { data, fetchMore }] =
    useLazyQuery<MessagePage>(QUERY);
  const [concatMessage, setConcatMessage] = useState<Message[]>([]);

  // 如果有问题 修改 userEffect 为 useLayoutEffect
  useEffect(() => {
    if (messages) {
      setLastSeqId(messages[0].seqId);
    }
    if (refOfPaper.current !== undefined) {
      refOfPaper.current.scrollTop = refOfPaper.current?.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (data && data.loadHistoryMessage) {
      setLastSeqId(data.loadHistoryMessage[0].seqId);
      setConcatMessage(_.concat(data.loadHistoryMessage ?? [], messages ?? []));
    }
  }, [data, messages]);

  function handleLoadMore() {
    if (data && fetchMore) {
      fetchMore({ variables: { userId: user?.id, lastSeqId } });
    } else {
      loadHistoryMessage({ variables: { userId: user?.id, lastSeqId } });
    }
  }

  return (
    <Paper square className={classes.paper} ref={refOfPaper}>
      <List className={classes.list}>
        {loadMore && (
          <ListItem button onClick={handleLoadMore}>
            <ListItemText
              style={{ display: 'flex', justifyContent: 'center' }}
              primary="点击加载更多"
            />
          </ListItem>
        )}
        {user &&
          concatMessage.map(({ uuid, createdAt, content, from, to }) => (
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
MessageList.defaultProps = {
  loadMore: false,
};

export default MessageList;
