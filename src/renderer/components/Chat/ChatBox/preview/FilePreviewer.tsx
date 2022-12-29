import {
  Avatar,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';
import {
  Batch,
  BatchItem,
  useBatchAddListener,
  useItemFinalizeListener,
  useUploady,
} from '@rpldy/uploady';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogTitle,
  PaperComponent,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import { Session } from 'renderer/domain/Session';
import { useAppDispatch } from 'renderer/store';
import {
  addLocalMessage,
  sendFileMessage,
  sendImageMessage,
} from 'renderer/state/session/sessionAction';
import { Content, Message } from 'renderer/domain/Message';
import { CreatorType } from 'renderer/domain/constant/Message';
import _ from 'lodash';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
  })
);

interface FilePreviewerProps {
  selectedSession: Session;
  fileType: 'FILE' | 'IMAGE' | 'AUTO' | undefined;
}

window.localMessageMap = new Map<string | undefined, Message>();
const uuidMap = new Map<string | undefined, string | undefined>();

export default function FilePreviewer(props: FilePreviewerProps) {
  const { selectedSession, fileType } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [items, setItems] = useState<BatchItem[]>([]);
  const dispatch = useAppDispatch();
  const { processPending } = useUploady();

  // 上传完成图片，进行发送
  useItemFinalizeListener((item: BatchItem) => {
    const uuid = uuidMap.get(item.id);
    if (item.uploadStatus === 200) {
      const mediaId = (item.uploadResponse.data as string[])[0];
      if (uuid && mediaId) {
        const localMessage = window.localMessageMap.get(uuid);
        if (localMessage) {
          localMessage.status = 'FILE_SENT';
          const updateLocalMessage = _.omit(localMessage, 'file');
          if (updateLocalMessage.content.contentType === 'IMAGE') {
            dispatch(
              sendImageMessage(
                selectedSession.conversation.userId,
                uuid,
                {
                  mediaId,
                  filename: item.file.name,
                  picSize: item.file.size,
                  type: item.file.type,
                },
                updateLocalMessage
              )
            );
            window.localMessageMap.set(uuid, localMessage);
          } else {
            dispatch(
              sendFileMessage(
                selectedSession.conversation.userId,
                uuid,
                {
                  mediaId,
                  filename: item.file.name,
                  size: item.file.size,
                  type: item.file.type,
                },
                updateLocalMessage
              )
            );
            window.localMessageMap.set(uuid, localMessage);
          }
        }
      }
    } else {
      // 文件发送失败
      const localMessage = window.localMessageMap.get(uuid);
      if (localMessage) {
        // localMessage = _.omit(localMessage, 'file');
        localMessage.status = 'ERROR';
        window.localMessageMap.set(uuid, localMessage);
        dispatch(addLocalMessage(_.omit(localMessage, 'file')));
      }
    }
  });

  useBatchAddListener((batch: Batch) => {
    setItems((it) => it.concat(batch.items));
  });

  const handleClose = () => {
    setOpenImageDialog(false);
    setTimeout(() => {
      setItems([]);
    }, 500);
  };

  useEffect(() => {
    // 有图片就弹窗
    if (items.length > 0) {
      setOpenImageDialog(true);
    }
  }, [items]);

  const handleImageDialogClose = (
    _event: unknown,
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason !== 'backdropClick') {
      handleClose();
    }
  };

  let oneImage = false;
  let hasFile = false;

  // 检查是否可以预览图片
  if (fileType === 'IMAGE' || fileType === 'AUTO') {
    if (items.length === 1 && items[0].file.type.startsWith('image')) {
      oneImage = true;
    } else {
      items.forEach((it) => {
        if (!it.file.type.startsWith('image')) {
          hasFile = true;
        }
      });
    }
  }

  const getPreviewer = () => {
    if (oneImage) {
      return (
        <img
          style={{ maxWidth: '240px', maxHeight: '240px' }}
          src={URL.createObjectURL(items[0].file as File)}
          alt="imageForSend"
        />
      );
    }
    // 列表
    return (
      <List dense className={classes.root}>
        {items.map((it) => {
          const key = it.batchId;
          if (it.file.type.startsWith('image')) {
            return (
              <ListItem key={key}>
                <ListItemAvatar>
                  <Avatar
                    variant="square"
                    alt={`Avatar n°${key + 1}`}
                    src={URL.createObjectURL(it.file as File)}
                  />
                </ListItemAvatar>
                <ListItemText
                  id={it.batchId}
                  primary={it.file.name}
                  secondary={it.file.size}
                />
              </ListItem>
            );
          }
          return (
            <ListItem key={key}>
              <ListItemAvatar>
                <Avatar variant="square" alt={`Avatar n°${key + 1}`}>
                  <InsertDriveFileIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                id={it.batchId}
                primary={it.file.name}
                secondary={it.file.size}
              />
            </ListItem>
          );
        })}
      </List>
    );
  };

  const sendLocalImage = (id: string, batchItem: BatchItem) => {
    const photoContent = {
      mediaId: URL.createObjectURL(batchItem.file as File),
      filename: batchItem.file.name,
      picSize: batchItem.file.size,
      type: batchItem.file.type,
    };
    const uuid = uuidv4();
    uuidMap.set(id, uuid);

    const content: Content = {
      contentType: 'IMAGE',
      photoContent,
    };
    const message: Message = {
      uuid,
      to: selectedSession.conversation.userId,
      type: CreatorType.CUSTOMER,
      creatorType: CreatorType.STAFF,
      content,
    };
    message.file = batchItem.file as File;
    message.localType = 'IMAGE';
    message.status = 'PENDDING';

    // 保存可能需要从新发送的消息
    window.localMessageMap.set(uuid, _.cloneDeep(message));
    dispatch(addLocalMessage(_.omit(message, 'file')));
  };

  return (
    <Dialog
      disableEnforceFocus
      open={openImageDialog}
      onClose={handleImageDialogClose}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle
        style={{ cursor: 'move' }}
        id="draggable-dialog-title"
        onClose={handleClose}
      >
        {hasFile ? t('Send file') : t('Send image')}
      </DialogTitle>
      <DialogContent>{getPreviewer()}</DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          {t('Cancel')}
        </Button>
        <Button
          onClick={() => {
            items.forEach((it) => {
              sendLocalImage(it.id, it);
            });
            handleClose();
            processPending();
          }}
          autoFocus
          color="primary"
          variant="outlined"
        >
          {t('editor.Send')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
