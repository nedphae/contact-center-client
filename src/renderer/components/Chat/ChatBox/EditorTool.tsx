/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
import { Menu, MenuItem } from '@material-ui/core';
import NestedMenuItem from 'material-ui-nested-menu-item';
import { Icon } from '@iconify/react';
import scissors2Line from '@iconify-icons/ri/scissors-2-line';

import './emoji-mart.global.css';
import { Picker, BaseEmoji } from 'emoji-mart';

import BlacklistForm from 'renderer/components/Blacklist/BlacklistForm';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import { BlacklistFormProp } from 'renderer/domain/Blacklist';
import useInitData from 'renderer/hook/data/useInitData';
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
  updateOrCreateConv,
} from 'renderer/state/session/sessionAction';
import { useFileInput, useUploady } from '@rpldy/uploady';
import { useAppDispatch } from 'renderer/store';
import { emojiZh } from 'renderer/i18n/emojiI18n';
import TransferForm from './transfer/TransferForm';
import FilePreviewer from './preview/FilePreviewer';

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
  setEmoji(msg: string): void;
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

function UploadyButton(props: { image: boolean }) {
  const { image } = props;
  const uploady = useUploady();
  const inputRef = useFileInput();

  return (
    <IconButton
      aria-label="upload"
      size="small"
      onClick={() => {
        if (inputRef.current) {
          inputRef.current.accept = image ? 'image/*' : '';
        }
        uploady.showFileUpload();
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.accept = '';
          }
        }, 100);
      }}
    >
      {image ? <ImageOutlinedIcon /> : <AttachmentOutlinedIcon />}
    </IconButton>
  );
}

function EditorTool(props: EditorProps, ref: React.Ref<HTMLDivElement>) {
  const classes = useStyles();
  const theme = useTheme();
  const { setEmoji, selectedSession } = props;
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();

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
  const [placement, setPlacement] = useState<PopperPlacementType>();
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const refOfTransferDialog = useRef<DraggableDialogRef>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement>();

  const { onLoadding, onCompleted, onError, onCompletedMsg } = useAlert();
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
    setEmoji(emoji);
    onClose();
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

  const emojiI18n = i18n.language === 'zh-CN' ? emojiZh : undefined;

  return (
    <Toolbar className={classes.toolBar} ref={ref}>
      <DraggableDialog
        title={t('editor.tool.Add to blacklist')}
        ref={refOfDialog}
      >
        <BlacklistForm defaultValues={blacklistInfo} />
      </DraggableDialog>
      {/* <Dialog
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
          {`${t('Send image to')}: ${selectedSession.user.name}`}
        </DialogTitle>
        {imageListToSend && (
          <SendImageForm urls={imageListToSend} send={sendImageList} />
        )}
      </Dialog> */}
      <FilePreviewer selectedSession={selectedSession} fileType="AUTO" />
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
              i18n={emojiI18n}
              native
              exclude={['flags']}
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
      <Tooltip title={t('editor.tool.File')} placement="top" arrow>
        <UploadyButton image={false} />
      </Tooltip>
      <Tooltip title={t('editor.tool.Image')} placement="top" arrow>
        <UploadyButton image />
      </Tooltip>
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
