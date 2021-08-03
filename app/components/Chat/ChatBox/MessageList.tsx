import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native-web';
import Viewer from 'react-viewer';

import _ from 'lodash';
import { gql, useLazyQuery } from '@apollo/client';

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
import config from 'app/config/clientConfig';
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
  classes: ClassNameMap<'message'>,
  openImageViewer: (src: string, alt: string) => void
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
      const imageUrl = `${config.web.host}${config.oss.path}/chat/img/${content.photoContent?.mediaId}`;
      const filename = content.photoContent?.filename;
      element = (
        <TouchableOpacity
          onPress={() => {
            openImageViewer(imageUrl, filename ?? 'img');
          }}
        >
          {/* <Image source={source} /> */}
          <img src={imageUrl} alt={filename} style={{ maxWidth: '600px' }} />
        </TouchableOpacity>
      );
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
`;

const QUERY = gql`
  ${CONTENT_QUERY}
  query HistoryMessage($userId: Long!, $offset: Long, $limit: Int) {
    loadHistoryMessage(userId: $userId, offset: $offset, limit: $limit) {
      ...MyMessageContent
    }
  }
`;
interface MessagePage {
  loadHistoryMessage: Message[];
}

const styles = StyleSheet.create({
  container: {
    maxHeight: '100%',
    width: '100%',
  },
});

const MessageList = (props: MessageListProps) => {
  const { messages, staff, user, loadMore } = props;
  const classes = useMessageListStyles();
  const refOfScrollView = useRef<ScrollView>(null);
  const [lastSeqId, setLastSeqId] = useState<number | null>(null);
  const [loadHistory, setLoadHistory] = useState<boolean>(false);
  const [loadHistoryMessage, { data, fetchMore }] = useLazyQuery<MessagePage>(
    QUERY,
    { fetchPolicy: 'cache-and-network' }
  );
  const [concatMessage, setConcatMessage] = useState<Message[]>([]);
  const [showImageViewerDialog, toggleShowImageViewerDialog] = useState(false);
  const [imageViewer, setImageViewer] = useState<{
    src: string;
    alt: string;
  }>({ src: '', alt: 'null' });

  // 如果有问题 修改 userEffect 为 useLayoutEffect
  useEffect(() => {
    if (messages && messages[0]) {
      setLastSeqId(messages[0].seqId ?? null);
      setConcatMessage(messages);
      setLoadHistory(false);
    }
  }, [messages]);

  // 防止渲染 卡顿
  useLayoutEffect(() => {
    // 如果 fetchMore 就不滚动
    if (refOfScrollView.current) {
      refOfScrollView.current.scrollToEnd({ animated: false });
    }
  }, [messages]);

  useEffect(() => {
    if (data && data.loadHistoryMessage && data.loadHistoryMessage[0]) {
      const loadMessage = _.reverse([...data.loadHistoryMessage]);
      setLastSeqId(loadMessage[0].seqId ?? null);
      setConcatMessage(_.concat(loadMessage ?? [], messages ?? []));
    }
  }, [data, messages]);

  function handleLoadMore() {
    if (data && fetchMore) {
      fetchMore({
        variables: { userId: user?.userId, offset: lastSeqId, limit: null },
      });
    } else {
      loadHistoryMessage({
        variables: { userId: user?.userId, offset: lastSeqId, limit: null },
      });
    }
    setLoadHistory(true);
  }

  function handleContentSizeChange() {
    // 检查是否是读取历史记录
    if (refOfScrollView.current && !loadHistory) {
      refOfScrollView.current.scrollToEnd({ animated: false });
    }
  }

  function closeImageViewerDialog() {
    toggleShowImageViewerDialog(false);
  }

  function getImages() {
    const imageMessages = concatMessage.filter(
      (message) => message.content.contentType === 'IMAGE'
    );
    const images = imageMessages.map((message) => {
      const url = `${config.web.host}${config.oss.path}/chat/img/${message.content.photoContent?.mediaId}`;
      return {
        url,
      };
    });
    return images;
  }

  function openImageViewer(src: string, alt: string) {
    setImageViewer({ src, alt });
    toggleShowImageViewerDialog(true);
  }

  return (
    <ScrollView
      style={styles.container}
      ref={refOfScrollView}
      onContentSizeChange={handleContentSizeChange}
      scrollEventThrottle={50}
    >
      {user && (
        <List className={classes.list}>
          {loadMore && (
            <ListItem button onClick={handleLoadMore}>
              <ListItemText
                style={{ display: 'flex', justifyContent: 'center' }}
                primary="点击加载更多"
              />
            </ListItem>
          )}
          {concatMessage &&
            concatMessage.map(
              ({ uuid, createdAt, content, creatorType, nickName }) => (
                <React.Fragment key={uuid}>
                  <ListItem alignItems="flex-start">
                    {/* 接受到的消息的头像 */}
                    {creatorType !== 1 && (
                      <ListItemAvatar className={classes.listItemAvatar}>
                        <Avatar alt="Profile Picture" />
                      </ListItemAvatar>
                    )}
                    {/* justify="flex-end" 如果是收到的消息就不设置这个 */}
                    <Grid
                      container
                      justify={creatorType !== 1 ? 'flex-start' : 'flex-end'}
                    >
                      <Grid item xs={12}>
                        <ListItemText
                          primary={
                            <Grid
                              container
                              alignItems="center"
                              justify={
                                creatorType !== 1 ? 'flex-start' : 'flex-end'
                              }
                            >
                              {/* justify="flex-end" */}
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                className={classes.inline}
                              >
                                {creatorType !== 1
                                  ? user.name
                                  : nickName ?? staff.nickName}
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
                          creatorType !== 1
                            ? classes.fromMessagePaper
                            : classes.toMessagePaper
                        }
                      >
                        {createContent(content, classes, openImageViewer)}
                      </Paper>
                    </Grid>
                    {/* 发送的消息的头像 */}
                    {creatorType === 1 && (
                      <ListItemAvatar className={classes.listItemAvatar}>
                        <Avatar alt="Profile Picture" />
                      </ListItemAvatar>
                    )}
                  </ListItem>
                </React.Fragment>
              )
            )}
        </List>
      )}
      <Viewer
        visible={showImageViewerDialog}
        onClose={closeImageViewerDialog}
        images={[imageViewer]}
        zIndex={2000}
      />
    </ScrollView>
  );
};
MessageList.defaultProps = {
  loadMore: false,
};

export default MessageList;
