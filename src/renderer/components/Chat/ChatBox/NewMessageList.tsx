/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import Viewer from 'react-viewer';
import clsx from 'clsx';
import { TouchableOpacity } from 'react-native-web';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import ErrorIcon from '@material-ui/icons/Error';
import classNames from 'classnames';
import _ from 'lodash';
import { gql, useQuery } from '@apollo/client';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import UndoIcon from '@material-ui/icons/Undo';

import { Content, Message, MessagesMap } from 'renderer/domain/Message';
import Staff from 'renderer/domain/StaffInfo';
import { Customer } from 'renderer/domain/Customer';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import {
  getDownloadS3ChatFilePath,
  getDownloadS3ChatImgPath,
  getDownloadS3StaffImgPath,
} from 'renderer/config/clientConfig';
import {
  newMessage,
  sendFileMessage,
  sendImageMessage,
  sendMessage,
  sendWithdrawMsg,
} from 'renderer/state/session/sessionAction';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import getPageQuery from 'renderer/domain/graphql/Page';
import { PageResult } from 'renderer/domain/Page';
import { CreatorType } from 'renderer/domain/constant/Message';
import { useAppDispatch } from 'renderer/store';
import { uploadFile } from 'renderer/service/fileService';
import {
  Box,
  ButtonGroup,
  CircularProgress,
  Fade,
  IconButton,
  Popper,
  PopperPlacementType,
  PopperProps,
  Tooltip,
} from '@material-ui/core';
import useAlert from 'renderer/hook/alert/useAlert';
import FileCard from './FileCard';
import RichTextStyle from './RichText.less';

export const useMessageListStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      maxHeight: '100%',
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    text: {
      padding: theme.spacing(2, 2, 0),
    },
    paper: {
      // paddingBottom: 50,
      maxHeight: '100%',
      width: '100%',
    },
    baseMessagePaper: {
      maxWidth: '90%',
      borderRadius: 10,
    },
    toMessagePaper: {
      // 如果是收到的消息就是 borderTopLeftRadius
      borderTopRightRadius: 0,
      backgroundColor: theme.palette.type === 'light' ? '#ffe48c' : '#8b6305',
    },
    fromMessagePaper: {
      // 如果是收到的消息就是 borderTopLeftRadius
      borderTopLeftRadius: 0,
    },
    listItemAvatar: {
      // 使用 float 优化 OR 使用 grid row-reverse
      marginBottom: 0,
      padding: 8,
      minWidth: 0,
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
      margin: 7,
    },
    sysMsg: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  })
);

export function createContent(
  message: Message,
  classes: ClassNameMap<'message'>,
  openImageViewer: (src: string, alt: string) => void
) {
  const { content } = message;
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
              <Typography
                variant="body2"
                gutterBottom
                className={classes.message}
              >
                {text}
              </Typography>
            );
            break;
          }
        }
      } else {
        element = (
          <Typography variant="body2" gutterBottom className={classes.message}>
            {text}
          </Typography>
        );
      }
      break;
    }
    case 'IMAGE': {
      const isLocalImage = Boolean(message.localType);
      let imageUrl: string;
      if (isLocalImage) {
        imageUrl = content.photoContent?.mediaId ?? '';
      } else {
        imageUrl = `${getDownloadS3ChatImgPath()}${
          content.photoContent?.mediaId
        }`;
      }

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
      // 生成音频
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
              margin: 7,
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

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
    },
    wrapper: {
      // margin: theme.spacing(1),
      position: 'relative',
      display: 'flex',
      width: '30px',
    },
    fabProgress: {
      position: 'absolute',
      top: -6,
      left: -6,
      zIndex: 1,
    },
    buttonProgress: {
      position: 'absolute',
      bottom: 0,
      // left: '50%',
      marginTop: '50px',
      // marginLeft: -12,
    },
  })
);

function ResendViewer(props: {
  uuid: string;
  message: Message;
  children: React.ReactNode;
}) {
  const { uuid, message, children } = props;
  const classes = useStyles();
  // const [progress, setProgress] = useState<number>();
  const [manualResend, setManualResend] = useState(false);
  const dispatch = useAppDispatch();
  const { onErrorMsg } = useAlert();

  const localMessage = window.localMessageMap.get(uuid);

  useEffect(() => {
    if (message.status === 'SENT') {
      window.localMessageMap.delete(message.uuid);
    }
  }, [message]);

  // 上传失败，重新上传
  const resendFileMessage = async () => {
    if (localMessage?.file) {
      try {
        setManualResend(true);
        let mediaId;
        if (message.status === 'FILE_SENT') {
          if (localMessage.content.contentType === 'IMAGE') {
            mediaId = message.content.photoContent?.mediaId;
          } else {
            mediaId = message.content.attachments?.mediaId;
          }
        }
        if (!mediaId) {
          const url = await uploadFile(localMessage?.file);
          if (url && url[0]) {
            [mediaId] = url;
            localMessage.status = 'FILE_SENT';
            window.localMessageMap.set(uuid, localMessage);
          }
        }
        if (mediaId) {
          if (localMessage && message.to) {
            const updateLocalMessage = _.omit(localMessage, 'file');
            if (localMessage.content.contentType === 'IMAGE') {
              dispatch(
                sendImageMessage(
                  message.to,
                  uuid,
                  {
                    mediaId,
                    filename: localMessage.file.name,
                    picSize: localMessage.file.size,
                    type: localMessage.file.type,
                  },
                  updateLocalMessage
                )
              );
            } else {
              dispatch(
                sendFileMessage(
                  message.to,
                  uuid,
                  {
                    mediaId,
                    filename: localMessage.file.name,
                    size: localMessage.file.size,
                    type: localMessage.file.type,
                  },
                  updateLocalMessage
                )
              );
            }
          }
        }
      } catch (ex) {
        onErrorMsg('Upload failed');
        setManualResend(false);
      }
    } else {
      // 非文件，直接发送
      dispatch(sendMessage(_.clone(message)));
    }
  };

  return (
    <>
      <div className={classes.wrapper}>
        <div className={classes.buttonProgress}>
          {message &&
            !manualResend &&
            message.localType &&
            message.status !== 'SENT' &&
            message.status !== 'PENDDING' && (
              <ErrorIcon color="secondary" onClick={resendFileMessage} />
            )}
          {message && message.status === 'PENDDING' && (
            <CircularProgress size={24} />
          )}
        </div>
      </div>
      {children}
    </>
  );
}

interface MessageListProps {
  messages: Message[];
  staff: Staff;
  user: Customer | undefined;
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
  'myMessageContent'
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

const NewMessageList = (props: MessageListProps) => {
  const { messages, staff, user } = props;
  const START_INDEX = 10000;
  const { t } = useTranslation();
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const refOfScrollView = useRef<VirtuosoHandle>(null);

  const lastSeqId = messages[0]?.seqId ?? null;

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<PopperProps['anchorEl']>(null);
  const [placement, setPlacement] = useState<PopperPlacementType>('right-end');

  const [withdrawUUID, setWithdrawUUID] = useState<{
    uuid: string;
    seqId?: number;
  }>();

  const classes = useMessageListStyles();
  const dispatch = useAppDispatch();

  const { data, fetchMore } = useQuery<MessagePage>(QUERY, {
    variables: { userId: user?.userId, cursor: lastSeqId, limit: 20 },
  });

  const [showImageViewerDialog, toggleShowImageViewerDialog] = useState(false);
  const [imageViewer, setImageViewer] = useState<ImageDecorator>({
    src: '',
    alt: undefined,
  });

  const hasMore = Boolean(!data?.loadHistoryMessage.last);

  const historyMessageList = data?.loadHistoryMessage?.content ?? [];
  const mergeMessage = [...historyMessageList, ...messages];
  // 去重
  const distinctMessageMap = _.defaults(
    {},
    ...mergeMessage.map((e) => {
      return { [e.uuid]: e } as MessagesMap;
    })
  );
  const distinctMessage = _.values(distinctMessageMap) as Message[];
  const sortedMessage = distinctMessage.sort((a, b) => {
    if (!a.seqId || !b.seqId) {
      return (
        ((a.createdAt as number) ?? Number.MAX_SAFE_INTEGER) -
        ((b.createdAt as number) ?? Number.MAX_SAFE_INTEGER)
      );
    }
    // 默认 seqId 为最大
    return (
      (a.seqId ?? Number.MAX_SAFE_INTEGER) -
      (b.seqId ?? Number.MAX_SAFE_INTEGER)
    );
  });
  const fetchMoreCursor = sortedMessage[0]?.seqId;

  // useEffect(() => {
  //   let ps: PerfectScrollbar;
  //   if (refOfScrollView.current) {
  //     ps = new PerfectScrollbar(refOfScrollView.current as unknown as Element, {
  //       suppressScrollX: true,
  //       suppressScrollY: false,
  //     });
  //   }
  //   return () => {
  //     if (ps) {
  //       ps.destroy();
  //     }
  //   };
  // }, [refOfScrollView]);

  const handleLoadMore = async () => {
    const msgResult = await fetchMore({
      variables: { userId: user?.userId, cursor: fetchMoreCursor, limit: 20 },
      updateQuery(previousQueryResult, options) {
        const newMessageList = [
          ...options.fetchMoreResult.loadHistoryMessage.content,
          ...previousQueryResult.loadHistoryMessage.content,
        ];
        const newOptions = _.cloneDeep(options);
        newOptions.fetchMoreResult.loadHistoryMessage.content = newMessageList;
        return newOptions.fetchMoreResult;
      },
    });
    const usersToPrepend = msgResult.data.loadHistoryMessage.size;
    const nextFirstItemIndex = firstItemIndex - usersToPrepend;
    setFirstItemIndex(() => nextFirstItemIndex);
  };

  const closeImageViewerDialog = () => {
    toggleShowImageViewerDialog(false);
  };

  const openImageViewer = (src: string, alt: string) => {
    setImageViewer({ src, alt });
    toggleShowImageViewerDialog(true);
  };

  const withdrawMsg = () => {
    if (user?.userId && withdrawUUID) {
      dispatch(sendWithdrawMsg(user?.userId, withdrawUUID));
      // 展示系统消息
      const content: Content = {
        contentType: 'SYS_TEXT',
        textContent: {
          text: t('withdrawShowStr'),
        },
      };
      const message: Message = {
        uuid: uuidv4(),
        seqId: withdrawUUID.seqId,
        to: user.userId,
        type: CreatorType.CUSTOMER,
        creatorType: CreatorType.STAFF,
        content,
        nickName: staff.nickName,
      };
      dispatch(newMessage({ [message.uuid]: message }));
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
      setPlacement(right ? 'left-end' : 'right-end');
      setOpen(right);
      setAnchorEl(event.currentTarget);
      setWithdrawUUID(uuidWithSeqId);
    };
  };

  const now = new Date();

  return (
    <>
      {user && (
        <Virtuoso
          className={classes.container}
          // components={{
          //   List: React.forwardRef((listProps, listRef) => {
          //     const { style, children } = listProps;
          //     return (
          //       <List
          //         style={style}
          //         component="div"
          //         ref={listRef}
          //         className={classes.list}
          //       >
          //         {children}
          //       </List>
          //     );
          //   }),
          // }}
          firstItemIndex={firstItemIndex}
          initialTopMostItemIndex={sortedMessage.length - 1}
          followOutput="smooth"
          data={sortedMessage}
          startReached={hasMore ? handleLoadMore : undefined}
          ref={refOfScrollView}
          itemContent={(_index, msg) => {
            const { uuid, seqId, createdAt, content, creatorType, nickName } =
              msg;
            return (
              <React.Fragment key={uuid}>
                {content.contentType === 'SYS_TEXT' ? (
                  <Grid container justifyContent="center">
                    {/* 展示系统消息 */}
                    <Typography
                      variant="caption"
                      align="center"
                      className={classes.sysMsg}
                    >
                      {content.textContent?.text}
                    </Typography>
                  </Grid>
                ) : (
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
                      style={{ width: 'calc(100% - 48px)' }}
                    >
                      <Grid item xs={12}>
                        <ListItemText
                          primary={
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
                          }
                        />
                      </Grid>
                      {/* 本地消息, 提示是否需要重发 */}
                      {creatorType === 1 && (
                        <ResendViewer uuid={uuid} message={msg}>
                          <Paper
                            onMouseEnter={handleMouseUp(
                              creatorType === 1 &&
                                Boolean(seqId) &&
                                now.getTime() - (createdAt as number) * 1000 <=
                                  2 * 60 * 1000,
                              { uuid, seqId }
                            )}
                            onMouseLeave={handleClose}
                            elevation={4}
                            className={clsx(
                              creatorType !== 1
                                ? classes.fromMessagePaper
                                : classes.toMessagePaper,
                              classes.baseMessagePaper
                            )}
                          >
                            {createContent(msg, classes, openImageViewer)}
                          </Paper>
                        </ResendViewer>
                      )}
                      {creatorType !== 1 && (
                        <Paper
                          onMouseEnter={handleMouseUp(
                            creatorType === 1 &&
                              Boolean(seqId) &&
                              now.getTime() - (createdAt as number) * 1000 <=
                                2 * 60 * 1000,
                            { uuid, seqId }
                          )}
                          onMouseLeave={handleClose}
                          elevation={4}
                          className={clsx(
                            creatorType !== 1
                              ? classes.fromMessagePaper
                              : classes.toMessagePaper,
                            classes.baseMessagePaper
                          )}
                        >
                          {createContent(msg, classes, openImageViewer)}
                        </Paper>
                      )}
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
                )}
              </React.Fragment>
            );
          }}
        />
      )}
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
      <Viewer
        visible={showImageViewerDialog}
        onClose={closeImageViewerDialog}
        images={[imageViewer]}
        zIndex={2000}
      />
    </>
  );
};

export default NewMessageList;
