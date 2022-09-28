/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native-web';
import Viewer from 'react-viewer';
import clsx from 'clsx';
import PerfectScrollbar from 'perfect-scrollbar';
import { useTranslation } from 'react-i18next';

import classNames from 'classnames';
import _ from 'lodash';
import { gql, useLazyQuery } from '@apollo/client';

import {
  createStyles,
  Theme,
  makeStyles,
  useTheme,
} from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import UndoIcon from '@material-ui/icons/Undo';

import { Content, Message } from 'renderer/domain/Message';
import Staff from 'renderer/domain/StaffInfo';
import { Customer } from 'renderer/domain/Customer';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import {
  getDownloadS3ChatFilePath,
  getDownloadS3ChatImgPath,
  getDownloadS3StaffImgPath,
} from 'renderer/config/clientConfig';
import {
  addHistoryMessage,
  sendWithdrawMsg,
  setHasMore,
  updateSync,
} from 'renderer/state/session/sessionAction';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { Session } from 'renderer/domain/Session';
import getPageQuery from 'renderer/domain/graphql/Page';
import { PageResult } from 'renderer/domain/Page';
import {
  getMonitor,
  setMonitoredHasMore,
  setMonitoredMessage,
} from 'renderer/state/chat/chatAction';
import { CreatorType } from 'renderer/domain/constant/Message';
import { useAppDispatch, useAppSelector } from 'renderer/store';
import {
  Box,
  ButtonGroup,
  Fade,
  IconButton,
  Popper,
  PopperPlacementType,
  PopperProps,
  Tooltip,
} from '@material-ui/core';
import {
  SyncMessageByUserGraphql,
  QUERY_SYNC_USER_MESSAGE,
} from 'renderer/domain/graphql/Monitor';
import { getMyself } from 'renderer/state/staff/staffAction';
import FileCard from './FileCard';
import RichTextStyle from './RichText.less';

export const useMessageListStyles = makeStyles((theme: Theme) =>
  createStyles({
    text: {
      padding: theme.spacing(2, 2, 0),
    },
    paper: {
      // paddingBottom: 50,
      maxHeight: '100%',
      width: '100%',
    },
    baseMessagePaper: {
      padding: 7,
      maxWidth: '70%',
      borderRadius: 10,
    },
    toMessagePaper: {
      // 如果是收到的消息就是 borderTopLeftRadius
      borderTopRightRadius: 0,
      backgroundColor: theme.palette.type === 'light' ? '#8ae549' : '#508828',
    },
    fromMessagePaper: {
      // 如果是收到的消息就是 borderTopLeftRadius
      borderTopLeftRadius: 0,
    },
    listItemAvatar: {
      // TODO 使用 float 优化 OR 使用 grid row-reverse
      marginBottom: 0,
      padding: 8,
      minWidth: 0,
    },
    list: {
      marginBottom: theme.spacing(2),
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
      maxWidth: '100%',
      userSelect: 'text',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      wordBreak: 'break-word',
    },
  }),
);

export function createContent(
  content: Content,
  classes: ClassNameMap<'message'>,
  openImageViewer: (src: string, alt: string) => void,
) {
  let element;
  switch (content.contentType) {
    case 'SYS': {
      break;
    }
    case 'TEXT': {
      const text = content.textContent?.text;
      if (content.sysCode) {
        switch (content.sysCode) {
          default: {
            element = (
              <ListItemText
                primary={(
                  <Typography
                    variant="body1"
                    gutterBottom
                    className={classes.message}
                  >
                    {text}
                  </Typography>
                )}
              />
            );
            break;
          }
        }
      } else {
        element = (
          <ListItemText
            primary={(
              <Typography
                variant="body1"
                gutterBottom
                className={classes.message}
              >
                {text}
              </Typography>
            )}
          />
        );
      }
      break;
    }
    case 'IMAGE': {
      const imageUrl = `${getDownloadS3ChatImgPath()}${
        content.photoContent?.mediaId
      }`;
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
        const { filename, size, mediaId } = content.attachments;
        const url = `${getDownloadS3ChatFilePath()}${mediaId}`;
        element = <FileCard filename={filename} fileSize={size} url={url} />;
      }
      break;
    }
    case 'LINK': {
      break;
    }
    case 'RICH_TEXT': {
      const text = content.textContent?.text;
      if (text) {
        const html = {
          __html: text,
        };
        element = (
          <Box
            style={{
              maxWidth: '600px',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
            className={classNames(RichTextStyle['Knowledge-content'])}
            dangerouslySetInnerHTML={html}
          />
        );
      }
      break;
    }
    default: {
      break;
    }
  }
  return element;
}

interface MessageListProps {
  session: Session | undefined;
  messages: Message[];
  staff: Staff;
  user: Customer | undefined;
  loadMore?: boolean;
}

const CONTENT_QUERY = gql`
  fragment myMessageContent on Message {
    content {
      contentType
      sysCode
      attachments {
        mediaId
        filename
        size
        type
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

const PAGE_QUERY = getPageQuery(
  'MessagePage',
  CONTENT_QUERY,
  'myMessageContent',
);

const QUERY = gql`
  ${PAGE_QUERY}
  query HistoryMessage($userId: Long!, $cursor: Long, $limit: Int) {
    loadHistoryMessage(userId: $userId, cursor: $cursor, limit: $limit) {
      ...pageOnMessagePage
    }
  }
`;

interface MessagePage {
  loadHistoryMessage: PageResult<Message>;
}

const MessageList = (props: MessageListProps) => {
  const { session, messages, staff, user, loadMore } = props;
  const theme = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      maxHeight: '100%',
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  });

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<PopperProps['anchorEl']>(null);
  const [placement, setPlacement] =
    useState<PopperPlacementType>('right-start');

  const [withdrawUUID, setWithdrawUUID] = useState<{
    uuid: string;
    seqId?: number;
  }>();

  const classes = useMessageListStyles();
  const dispatch = useAppDispatch();

  // 查询是否是监控
  const monitorSession = useAppSelector(getMonitor)?.monitoredSession;
  const refOfScrollView = useRef<ScrollView>(null);
  const [loadHistoryMessage, { data, variables }] = useLazyQuery<MessagePage>(
    QUERY,
    {
      fetchPolicy: 'no-cache',
    },
  );
  const [syncMessageByUser, { data: syncMsg, variables: syncVariables }] =
    useLazyQuery<SyncMessageByUserGraphql>(QUERY_SYNC_USER_MESSAGE, {
      fetchPolicy: 'no-cache',
    });

  const [showImageViewerDialog, toggleShowImageViewerDialog] = useState(false);
  const [animated, setAnimated] = useState<boolean>(false);
  const [isHistoryMessage, setIsHistoryMessage] = useState<boolean>(false);
  const [imageViewer, setImageViewer] = useState<ImageDecorator>({
    src: '',
    alt: undefined,
  });

  const lastSeqId = messages[0]?.seqId ?? null;
  const hasMore = Boolean(session?.hasMore);

  useEffect(() => {
    let ps: PerfectScrollbar;
    if (refOfScrollView.current) {
      ps = new PerfectScrollbar(refOfScrollView.current as unknown as Element, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return () => {
      ps.destroy();
    };
  }, [refOfScrollView]);

  // // 防止渲染 卡顿 用 handleContentSizeChange + 动画代替
  // useLayoutEffect(() => {
  //   // 如果 fetchMore 就不滚动
  //   if (refOfScrollView.current && !session?.isHistoryMessage) {
  //     refOfScrollView.current.scrollToEnd({ animated });
  //     if (session?.conversation.userId) {
  //       dispatch(clearAnimated(session?.conversation.userId));
  //     }
  //   }
  // }, [animated, dispatch, session]);

  useEffect(() => {
    if (data && data.loadHistoryMessage) {
      setIsHistoryMessage(true);
    }
  }, [data]);

  useEffect(() => {
    if (data && data.loadHistoryMessage && user && user.userId && variables) {
      const lastQueryUserId = variables.userId;
      if (lastQueryUserId === user.userId) {
        const lastMessage = data.loadHistoryMessage.content[0];
        if (
          lastMessage &&
          (user.userId === lastMessage.to || user.userId === lastMessage.from)
        ) {
          const historyMessage = _.reverse([
            ...data.loadHistoryMessage.content,
          ]);
          const userMessages = { [user.userId]: historyMessage };
          // TODO: 拆分到独立的 ThunkAction 里
          if (monitorSession) {
            // 监控历史消息
            dispatch(setMonitoredMessage(userMessages));
            dispatch(
              setMonitoredHasMore({
                userId: user.userId,
                hasMore: !data.loadHistoryMessage.last,
              }),
            );
          } else {
            // 客服聊天历史消息
            dispatch(addHistoryMessage(userMessages));
            dispatch(
              setHasMore({
                userId: user.userId,
                hasMore: !data.loadHistoryMessage.last,
              }),
            );
          }
        } else if (monitorSession) {
          dispatch(
            setMonitoredHasMore({
              userId: user.userId,
              hasMore: false,
            }),
          );
        } else {
          // 没有更多消息
          dispatch(
            setHasMore({
              userId: user.userId,
              hasMore: false,
            }),
          );
        }
      }
    }
  }, [data, dispatch, monitorSession, user, variables]);

  useEffect(() => {
    return () => {
      setAnimated(false);
    };
  }, [user]);

  const handleLoadMore = useCallback(() => {
    loadHistoryMessage({
      variables: { userId: user?.userId, cursor: lastSeqId, limit: 20 },
    });
  }, [lastSeqId, loadHistoryMessage, user]);

  useEffect(() => {
    if (
      syncMsg &&
      syncMsg.syncMessageByUser.size > 0 &&
      user &&
      user.userId &&
      syncVariables
    ) {
      const lastQueryUserId = syncVariables.userId;
      if (lastQueryUserId === user.userId) {
        const lastMessage = syncMsg.syncMessageByUser.content[0];
        if (
          lastMessage &&
          (user.userId === lastMessage.to || user.userId === lastMessage.from)
        ) {
          const historyMessage = syncMsg.syncMessageByUser.content;
          const userMessages = { [user.userId]: historyMessage };
          dispatch(addHistoryMessage(userMessages));
        }
      }
    }
  }, [dispatch, syncMsg, user, syncVariables]);

  useEffect(() => {
    if (user && user?.userId && messages.length === 0 && session?.hasMore) {
      handleLoadMore();
    }
    if (user && user?.userId && session?.shouldSync && messages.length > 0) {
      syncMessageByUser({
        variables: {
          userId: user?.userId,
          cursor: messages[messages.length - 1].seqId,
        },
      });
      dispatch(updateSync({ userId: user?.userId, shouldSync: false }));
    }
  }, [
    dispatch,
    handleLoadMore,
    lastSeqId,
    messages,
    session,
    syncMessageByUser,
    user,
  ]);

  const handleContentSizeChange = useCallback(
    (_contentWidth: number, contentHeight: number) => {
      // 检查是否是读取历史记录
      if (refOfScrollView.current && user && user.userId) {
        if (!isHistoryMessage) {
          // 判断是否消息列表长度是否小于屏幕高度，如果小于，则滚动到顶部，否则滚动到减去 scrollViewHeight 的位置
          const scrollViewHeight = (
            refOfScrollView.current as unknown as HTMLDivElement
          ).clientHeight;
          if (contentHeight > scrollViewHeight) {
            refOfScrollView.current.scrollTo({
              x: 0,
              y: contentHeight - scrollViewHeight,
              animated: false,
            });
          } else {
            refOfScrollView.current.scrollTo({ x: 0, y: 0, animated: false });
          }
          if (!animated) {
            setAnimated(true);
          }
        } else {
          setIsHistoryMessage(false);
        }
      }
    },
    [animated, isHistoryMessage, user]
  );

  const closeImageViewerDialog = () => {
    toggleShowImageViewerDialog(false);
  };

  function getImages() {
    const imageMessages = messages.filter(
      (message) => message.content.contentType === 'IMAGE',
    );
    const images = imageMessages.map((message) => {
      const url = `${getDownloadS3ChatImgPath}${message.content.photoContent?.mediaId}`;
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

  const withdrawMsg = () => {
    if (user?.userId && withdrawUUID) {
      dispatch(sendWithdrawMsg(user?.userId, withdrawUUID));
    }
    setWithdrawUUID(undefined);
  };

  const id = open ? 'faked-reference-popper' : undefined;

  const handleClose = () => {
    setOpen(false);
  };

  const handleMouseUp = (
    right: boolean,
    uuidWithSeqId?: { uuid: string; seqId?: number }
  ) => {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      setPlacement(right ? 'left-start' : 'right-start');
      setOpen(right);
      setAnchorEl(event.currentTarget);
      setWithdrawUUID(uuidWithSeqId);
    };
  };

  // TODO 使用 View + Map 精确跳转到置顶聊天消息
  return (
    <ScrollView
      style={styles.container}
      ref={refOfScrollView}
      onContentSizeChange={handleContentSizeChange}
      scrollEventThrottle={50}
    >
      <Popper
        onMouseEnter={() => {
          setOpen(true);
        }}
        onMouseLeave={handleClose}
        id={id}
        open={open}
        anchorEl={anchorEl}
        transition
        placement={placement}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <ButtonGroup
              aria-label="outlined primary button group"
              style={{ paddingLeft: '5px', paddingRight: '5px' }}
            >
              <Tooltip title={t('Withdraw')}>
                <IconButton
                  aria-label="withdraw"
                  style={{ borderRadius: 0 }}
                  size="small"
                  onClick={withdrawMsg}
                >
                  <UndoIcon />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Fade>
        )}
      </Popper>
      {user && (
        <List className={classes.list}>
          {loadMore && hasMore && (
            <ListItem button onClick={handleLoadMore}>
              <ListItemText
                style={{ display: 'flex', justifyContent: 'center' }}
                primary={t('Load More')}
              />
            </ListItem>
          )}
          {messages &&
            messages.map(
              (
                { uuid, seqId, createdAt, content, creatorType, nickName, from },
                index,
                msgs
              ) => (
                <React.Fragment key={uuid}>
                  <ListItem alignItems="flex-start">
                    {/* 接受到的消息的头像 */}
                    {creatorType !== 1 && (
                      <ListItemAvatar className={classes.listItemAvatar}>
                        <Avatar alt="Profile Picture" />
                      </ListItemAvatar>
                    )}
                    {/* justifyContent="flex-end" 如果是收到的消息就不设置这个 */}
                    <Grid
                      container
                      justifyContent={
                        creatorType !== 1 ? 'flex-start' : 'flex-end'
                      }
                    >
                      <Grid item xs={12}>
                        <ListItemText
                          primary={(
                            <Grid
                              container
                              alignItems="center"
                              justifyContent={
                                creatorType !== 1 ? 'flex-start' : 'flex-end'
                              }
                            >
                              {/* justifyContent="flex-end" */}
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
                          )}
                        />
                      </Grid>
                      <Paper
                        onMouseEnter={handleMouseUp(
                          creatorType === 1 &&
                            index + 1 === msgs.length &&
                            !from,
                          { uuid, seqId },
                        )}
                        onMouseLeave={handleClose}
                        elevation={4}
                        className={clsx(
                          creatorType !== 1
                            ? classes.fromMessagePaper
                            : classes.toMessagePaper,
                          classes.baseMessagePaper,
                        )}
                      >
                        {createContent(content, classes, openImageViewer)}
                      </Paper>
                    </Grid>
                    {/* 发送的消息的头像 */}
                    {creatorType === CreatorType.STAFF && (
                      <ListItemAvatar className={classes.listItemAvatar}>
                        <Avatar
                          src={
                            staff.avatar &&
                            `${getDownloadS3StaffImgPath()}${staff.avatar}`
                          }
                        />
                      </ListItemAvatar>
                    )}
                  </ListItem>
                </React.Fragment>
              ),
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
