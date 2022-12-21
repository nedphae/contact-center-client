/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { v4 as uuidv4 } from 'uuid';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import InsertEmoticonOutlinedIcon from '@material-ui/icons/InsertEmoticonOutlined';
import AttachmentOutlinedIcon from '@material-ui/icons/AttachmentOutlined';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import LaunchOutlinedIcon from '@material-ui/icons/LaunchOutlined';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import SpeakerNotesOffIcon from '@material-ui/icons/SpeakerNotesOff';
import StarIcon from '@material-ui/icons/Star';
import Tooltip from '@material-ui/core/Tooltip';
import Popper, { PopperPlacementType } from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Dialog, Menu, MenuItem } from '@material-ui/core';
import NestedMenuItem from 'material-ui-nested-menu-item';
import { Icon } from '@iconify/react';
import scissors2Line from '@iconify-icons/ri/scissors-2-line';

import './emoji-mart.global.css';
import { Picker, BaseEmoji } from 'emoji-mart';
import Upload from 'rc-upload';
import { RcFile } from 'rc-upload/lib/interface';

import { getUploadS3ChatPath } from 'renderer/config/clientConfig';
import { Attachments, PhotoContent } from 'renderer/domain/Message';
import BlacklistForm from 'renderer/components/Blacklist/BlacklistForm';
import DraggableDialog, {
  DialogTitle,
  DraggableDialogRef,
  PaperComponent,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import { BlacklistFormProp } from 'renderer/domain/Blacklist';
import useInitData from 'renderer/hook/init/useInitData';
import { SessionCategory } from 'renderer/domain/SessionCategory';
import { useMutation } from '@apollo/client';
import {
  MutationConversationGraphql,
  MUTATION_CONVERSATOIN,
} from 'renderer/domain/graphql/Conversation';
import { Session } from 'renderer/domain/Session';
import {
  ConversationCategory,
  createConversationCategory,
  TransferQuery,
} from 'renderer/domain/Conversation';
import useAlert from 'renderer/hook/alert/useAlert';
import {
  sendEvaluationInvitedMsg,
  sendFileMessage,
  sendImageMessage,
  updateOrCreateConv,
} from 'renderer/state/session/sessionAction';
import { BatchItem, useItemFinalizeListener } from '@rpldy/uploady';
import { useAppDispatch, useAppSelector } from 'renderer/store';
import {
  addImageToSend,
  clearImageToSend,
  getImageListToSend,
} from 'renderer/state/chat/chatAction';
import SendImageForm from 'renderer/components/Form/SendImageForm';
import TransferForm from './transfer/TransferForm';

const useStyles = makeStyles(() =>
  createStyles({
    toolBar: {
      minHeight: 30,
      // background: '#424242',
      borderTopStyle: 'solid',
      borderWidth: 1,
      // 是否将按钮调中间
      // justifyContent: 'center',
    },
    popper: {
      zIndex: 1,
    },
  })
);

interface EditorProps {
  textMessage: string;
  setMessage(msg: string): void;
  selectedSession: Session;
}

function createSessionCategory(
  sessionCategoryTreeList: SessionCategory[],
  open: boolean,
  handleItemClick: (sessionCategory: SessionCategory) => void
) {
  return sessionCategoryTreeList.map((it) => {
    if (it.children) {
      return (
        <NestedMenuItem
          label={it.categoryName}
          key={it.id}
          parentMenuOpen={open}
          onClick={() => handleItemClick(it)}
        >
          {createSessionCategory(it.children, open, handleItemClick)}
        </NestedMenuItem>
      );
    }
    return (
      <MenuItem key={it.id} onClick={() => handleItemClick(it)}>
        {it.categoryName}
      </MenuItem>
    );
  });
}

function EditorTool(props: EditorProps, ref: React.Ref<HTMLDivElement>) {
  const classes = useStyles();
  const theme = useTheme();
  const { textMessage, setMessage, selectedSession } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const imageListToSend = useAppSelector(getImageListToSend);

  const blacklistInfo: BlacklistFormProp = {
    preventStrategy: 'UID',
    preventSource: selectedSession.user.uid,
    ip: selectedSession.user.status?.ip ?? 'unknown',
    uid: selectedSession.user.uid,
  };

  const transferQuery: TransferQuery = {
    type: 'STAFF',
    userId: selectedSession.conversation.userId,
    fromStaffId: selectedSession.conversation.staffId,
  };

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();
  const [open, setOpen] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [placement, setPlacement] = useState<PopperPlacementType>();
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const refOfTransferDialog = useRef<DraggableDialogRef>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement>();

  const { onLoadding, onCompleted, onError, onCompletedMsg, onErrorMsg } =
    useAlert();
  const [updateCategory, { loading, data }] =
    useMutation<MutationConversationGraphql>(MUTATION_CONVERSATOIN, {
      onCompleted,
      onError,
    });
  if (loading) {
    onLoadding(loading);
  }

  useEffect(() => {
    if (data && data.updateConversationCategory) {
      // 修改会话类型后更新本地的会话
      dispatch(updateOrCreateConv(data.updateConversationCategory));
    }
  }, [data, dispatch]);

  const { sessionCategoryTreeList } = useInitData(false);

  function handleSendImageMessage(photoContent: PhotoContent) {
    if (selectedSession) {
      dispatch(
        sendImageMessage(selectedSession.conversation.userId, photoContent)
      );
    }
  }

  function handleSendFileMessage(attachments: Attachments) {
    if (selectedSession) {
      dispatch(
        sendFileMessage(selectedSession.conversation.userId, attachments)
      );
    }
  }

  useItemFinalizeListener((item: BatchItem) => {
    const mediaId = (item.uploadResponse.data as string[])[0];
    if (item.file.type.startsWith('image')) {
      dispatch(addImageToSend([mediaId]));
    } else {
      handleSendFileMessage({
        mediaId,
        filename: item.file.name,
        size: item.file.size,
        type: item.file.type,
      });
    }
  });

  function handleClickBlacklist() {
    refOfDialog.current?.setOpen(true);
  }

  function handleClickTransfer() {
    refOfTransferDialog.current?.setOpen(true);
  }

  const handleClick =
    (newPlacement: PopperPlacementType) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen((prev) => placement !== newPlacement || !prev);
      setPlacement(newPlacement);
    };

  const onClose = () => setOpen(false);

  const addEmoji = (emojiData: BaseEmoji) => {
    const emoji = emojiData.native;
    setMessage(textMessage + emoji);
    onClose();
  };

  const imgUploadProps = {
    action: `${getUploadS3ChatPath()}`,
    multiple: false,
    accept: 'image/*',
    onStart(file: RcFile) {
      // console.log('onStart', file, file.name);
    },
    onSuccess(response: unknown, file: RcFile, _xhr: unknown) {
      // console.log('onSuccess', response);
      // 发送图片消息
      handleSendImageMessage({
        mediaId: (response as string[])[0],
        filename: file.name,
        picSize: file.size,
        type: file.type,
      });
    },
    onError(error: Error, _ret: any, _file: RcFile) {
      // console.log('onError', error);
      onErrorMsg(t('Image upload failed'));
    },
  };

  const fileUploadProps = {
    action: `${getUploadS3ChatPath()}`,
    multiple: false,
    accept: '*',
    onStart(file: RcFile) {
      // console.log('onStart', file, file.name);
    },
    onSuccess(response: unknown, file: RcFile, _xhr: unknown) {
      // console.log('onSuccess', response);
      // 发送图片消息
      handleSendFileMessage({
        mediaId: (response as string[])[0],
        filename: file.name,
        size: file.size,
        type: file.type,
      });
    },
    onError(error: Error, _ret: any, _file: RcFile) {
      // console.log('onError', error);
      onErrorMsg(t('File upload failed'));
    },
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(undefined);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (menuAnchorEl) {
      return;
    }
    event.preventDefault();
    setMenuAnchorEl(event.currentTarget);
  };

  async function updateConversationCategory(sessionCategory: SessionCategory) {
    // 设置 总结
    const conversationCategory: ConversationCategory =
      createConversationCategory(
        selectedSession.conversation.id,
        sessionCategory
      );
    await updateCategory({ variables: { conversationCategory } });
    // 关闭 menu
    handleMenuClose();
  }

  function sendEvaluationInvited() {
    const { userId } = selectedSession.conversation;
    dispatch(sendEvaluationInvitedMsg(userId));
    onCompletedMsg(t('chat.editor.tool.Rate invitation has been sent'));
  }

  if (imageListToSend && !openImageDialog) {
    setOpenImageDialog(true);
  }

  const handleImageClose = () => {
    setOpenImageDialog(false);
    dispatch(clearImageToSend());
  };

  const sendImageList = (imgUrls: string[]) => {
    handleImageClose();
    imgUrls.forEach((url) => {
      handleSendImageMessage({
        mediaId: url,
        filename: uuidv4().substring(0, 8),
        picSize: 0,
        type: 'unknown',
      });
    });
  };

  const handleImageDialogClose = (
    _event: unknown,
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason !== 'backdropClick') {
      handleImageClose();
    }
  };

  const capture = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.shiftKey) {
      window.electron.ipcRenderer.sendMessage('hide-main-window');
      setTimeout(() => {
        window.electron.ipcRenderer.sendMessage('start-capture');
      }, 200);
    } else {
      window.electron.ipcRenderer.sendMessage('start-capture');
    }
  };

  return (
    <Toolbar className={classes.toolBar} ref={ref}>
      <DraggableDialog
        title={t('editor.tool.Add to blacklist')}
        ref={refOfDialog}
      >
        <BlacklistForm defaultValues={blacklistInfo} />
      </DraggableDialog>
      <Dialog
        disableEnforceFocus
        fullWidth
        maxWidth="md"
        open={openImageDialog}
        onClose={handleImageDialogClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle
          style={{ cursor: 'move' }}
          id="draggable-dialog-title"
          onClose={handleImageClose}
        >
          {t('Detailed chat message')}
        </DialogTitle>
        {imageListToSend && (
          <SendImageForm urls={imageListToSend} send={sendImageList} />
        )}
      </Dialog>
      <TransferForm defaultValues={transferQuery} ref={refOfTransferDialog} />
      <Menu
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorEl={menuAnchorEl}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {/* 获取咨询分类列表 */}
        {sessionCategoryTreeList &&
          createSessionCategory(
            sessionCategoryTreeList,
            Boolean(menuAnchorEl),
            updateConversationCategory
          )}
      </Menu>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        className={classes.popper}
      >
        {() => (
          // { TransitionProps }
          // 不使用延迟
          // <Fade {...TransitionProps} timeout={350}>
          <ClickAwayListener onClickAway={onClose}>
            <Picker
              onSelect={addEmoji}
              title="emoji"
              theme={theme.palette.type}
            />
          </ClickAwayListener>
          // </Fade>
        )}
      </Popper>

      <Tooltip title={t('editor.tool.Emoji')} placement="top" arrow>
        <IconButton
          onClick={handleClick('top-start')}
          aria-label="emoji"
          disabled={false}
          size="small"
        >
          <InsertEmoticonOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Upload {...fileUploadProps}>
        <Tooltip title={t('editor.tool.File')} placement="top" arrow>
          <IconButton aria-label="upload file" size="small">
            <AttachmentOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Upload>

      <Upload {...imgUploadProps}>
        <Tooltip title={t('editor.tool.Image')} placement="top" arrow>
          <IconButton aria-label="upload image" size="small">
            <ImageOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Upload>
      <Tooltip title={t('editor.tool.Transfer')} placement="top" arrow>
        <IconButton
          aria-label="transfer"
          size="small"
          onClick={handleClickTransfer}
        >
          <LaunchOutlinedIcon />
        </IconButton>
      </Tooltip>
      {/* <Tooltip title="邀请">
        <IconButton color="primary" aria-label="invite" size="small">
          <PersonAddOutlinedIcon />
        </IconButton>
      </Tooltip> */}
      <Tooltip title={t('editor.tool.Invite to rate')} placement="top" arrow>
        <IconButton
          aria-label="evaluate"
          size="small"
          onClick={sendEvaluationInvited}
        >
          <StarIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={t('editor.tool.Conversation Category')}
        placement="top"
        arrow
      >
        <IconButton
          aria-label="Conversation Category"
          size="small"
          onClick={handleMenuOpen}
        >
          <AssignmentTurnedInIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('editor.tool.Block')} placement="top" arrow>
        <IconButton
          aria-label="evaluate"
          size="small"
          onClick={handleClickBlacklist}
        >
          <SpeakerNotesOffIcon />
        </IconButton>
      </Tooltip>

      {window.electron && (
        <Tooltip title={t('editor.tool.Capture')} placement="top" arrow>
          <IconButton aria-label="evaluate" size="small" onClick={capture}>
            <Icon icon={scissors2Line} width="24" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export default forwardRef<HTMLDivElement, EditorProps>(EditorTool);
