import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import {
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Typography,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';

import {
  hideSelectedSessionAndSetToLast,
  sendTextMessage,
  setStaffDraft,
} from 'renderer/state/session/sessionAction';
import { Session } from 'renderer/domain/Session';
import { getMyself } from 'renderer/state/staff/staffAction';
import useAlert from 'renderer/hook/alert/useAlert';
import { useAppDispatch, useAppSelector } from 'renderer/store';
import { debounceTime, Subject } from 'rxjs';
import EditorTool from './EditorTool';

const style = {
  display: 'flex',
  // alignItems: 'center',
  justifyContent: 'center',
  border: 'solid 0px #ddd',
} as const;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textarea: {
      width: '100vw !important',
      height: '100% !important',
      marginBlockEnd: 'auto',
      border: 0,
      resize: 'none',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderColor: theme.palette.background.paper,
    },
    quickReply: {
      width: '40vw',
    },
  })
);

interface SelectedProps {
  selectedSession: Session | undefined;
}

const searchQuickReply = (searchText: string) => {
  const result: QuickReply[] = [];
  if (searchText && searchText !== '') {
    const noGroupResult = window.noGroupFuse.search(searchText);
    noGroupResult.forEach((r) => result.push(r.item));
  }
  return result;
};

const subjectSearchText = new Subject<string>();

export default function Editor(selected: SelectedProps) {
  const { selectedSession } = selected;
  const { t } = useTranslation();

  // 状态提升 设置当天聊天的消息 TODO: 保存到当前用户session的草稿箱
  const [tempTextMessage, setTempTextMessage] = useState<string>(
    selectedSession?.staffDraft ?? ''
  );

  const dispatch = useAppDispatch();
  // 展示 快捷回复
  const [open, setOpen] = useState(true);
  const anchorRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const menuListRef = useRef<HTMLUListElement>(null);
  const classes = useStyles();

  const mySelf = useAppSelector(getMyself);
  const { onErrorMsg } = useAlert();

  const quickReplyList = searchQuickReply(tempTextMessage);

  const momeSubject = useMemo(() => {
    return subjectSearchText.pipe(debounceTime(200)).subscribe({
      next: (it) => {
        if (selectedSession?.user.id) {
          dispatch(
            setStaffDraft({ userId: selectedSession.user.id, staffDraft: it })
          );
        }
      },
    });
  }, [dispatch, selectedSession?.user]);
  useEffect(() => {
    return () => {
      momeSubject.unsubscribe();
    };
  }, [momeSubject]);

  function setMessage(message: string) {
    subjectSearchText.next(message);
    setTempTextMessage(message);
  }

  const setEmoji = (emoji: string) => {
    const cur = textFieldRef.current?.selectionEnd ?? 0;
    const startText = tempTextMessage.slice(0, cur);
    const endText = tempTextMessage.slice(cur);
    setMessage(startText + emoji + endText);
    // console.info(
    //   '选择的表情: %s \t 位置: %s 长度: %s \t startText: %s \t endText: %s \t 合并: %s',
    //   emoji,
    //   cur,
    //   tempTextMessage.length,
    //   startText,
    //   endText,
    //   startText + emoji + endText
    // );
    setTimeout(() => {
      // 每个 emoji 占两个字符
      const newCur = cur + 2;
      textFieldRef.current?.setSelectionRange(newCur, newCur);
    });
  };

  const filterQuickReplyList = quickReplyList?.filter(
    (it) => it.content !== tempTextMessage
  );

  const shouldOpen = Boolean(
    filterQuickReplyList && filterQuickReplyList.length > 0
  );

  function handleTextChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setOpen(true);
    setMessage(event.target.value);
  }

  function handleSendTextMessage() {
    if (mySelf.onlineStatus !== 'OFFLINE') {
      if (selectedSession && tempTextMessage !== '') {
        setMessage('');
        dispatch(
          sendTextMessage(selectedSession.conversation.userId, tempTextMessage)
        );
      }
    } else {
      onErrorMsg(
        t(
          'editor.The current customer service is not online, and the message cannot be sent'
        )
      );
    }
  }

  const escNode = () => {
    if (selectedSession) {
      // esc 隐藏会话
      dispatch(hideSelectedSessionAndSetToLast());
    }
  };

  function setFocusToQuickReplyMenu(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      escNode();
    } else if (
      event.key === 'ArrowDown' ||
      (event.key === 'ArrowUp' && open && shouldOpen)
    ) {
      event.preventDefault();
      menuListRef.current?.focus();
    } else if (!event.shiftKey && event.key === 'Enter') {
      handleSendTextMessage();
      event.preventDefault();
    }
  }

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const handleSelectItem =
    (text: string) => (event: React.MouseEvent<EventTarget>) => {
      setMessage(text);
      handleClose(event);
      textFieldRef.current?.focus();
    };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab' || event.key === 'Escape') {
      setOpen(false);
      event.preventDefault();
      textFieldRef.current?.focus();
    }
  }

  useEffect(() => {
    if (selectedSession) {
      textFieldRef.current?.focus();
    }
  }, [selectedSession]);

  return (
    <>
      {/* TODO: 后期改为更丝滑的 QQ 操作 */}
      <Popper
        open={open && shouldOpen}
        anchorEl={anchorRef.current}
        placement="top-start"
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'bottom center',
            }}
          >
            <Paper className={classes.quickReply}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  id="menu-list-grow"
                  onKeyDown={handleListKeyDown}
                  ref={menuListRef}
                >
                  <MenuItem disabled>
                    {t(
                      'editor.Press the up key twice to select, press the tab to cancel the selection'
                    )}
                  </MenuItem>
                  {quickReplyList &&
                    quickReplyList.map((quickReply) => (
                      <MenuItem
                        key={quickReply.id}
                        onClick={handleSelectItem(quickReply.content)}
                      >
                        <Typography variant="inherit" noWrap>
                          <strong>{`[${quickReply.title}]: `}</strong>
                          {quickReply.content}
                        </Typography>
                      </MenuItem>
                    ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {/* 把  EditorTool 和 Editor 这两个组件合并到一块，防止渲染 MessageList */}
      {selectedSession && (
        <EditorTool
          ref={anchorRef}
          setEmoji={setEmoji}
          selectedSession={selectedSession}
        />
      )}
      <div
        style={{ ...style, width: 'auto', height: '100%', minHeight: '60px' }}
      >
        {selectedSession && (
          <>
            <TextareaAutosize
              autoFocus
              ref={textFieldRef}
              className={classes.textarea}
              aria-label="maximum height"
              placeholder={t('editor.Placeholder')}
              onChange={handleTextChange}
              onKeyDown={setFocusToQuickReplyMenu}
              value={tempTextMessage}
              minRows={3}
              disabled={
                // 如果会话是因为转接结束的，就不能再发消息
                Boolean(selectedSession.conversation.endTime) &&
                ['TRANSFER', 'ADMIN_TAKE_OVER'].includes(
                  selectedSession.conversation.closeReason ?? 'USER_LEFT'
                )
              }
            />
            <Button
              // 是否可用，通过 TextareaAutosize 判断
              disabled={tempTextMessage === ''}
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSendTextMessage}
            >
              {t('editor.Send')}
            </Button>
            <Button
              style={{ minWidth: 50 }}
              variant="outlined"
              onClick={escNode}
            >
              {t('editor.Close')}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
