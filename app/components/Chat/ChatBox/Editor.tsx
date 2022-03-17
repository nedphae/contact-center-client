import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounceTime, Subject } from 'rxjs';

import { createStyles, makeStyles } from '@material-ui/core/styles';
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
import Icon from '@material-ui/core/Icon';

import {
  hideSelectedSessionAndSetToLast,
  sendTextMessage,
} from 'app/state/session/sessionAction';
import {
  getSearchQuickReply,
  setQuickReplySearchText,
} from 'app/state/chat/chatAction';
import { Session } from 'app/domain/Session';
import { CloseReason } from 'app/domain/constant/Conversation';
import { getMyself } from 'app/state/staff/staffAction';
import { OnlineStatus } from 'app/domain/constant/Staff';
import useAlert from 'app/hook/alert/useAlert';
import EditorTool from './EditorTool';

const style = {
  display: 'flex',
  // alignItems: 'center',
  justifyContent: 'center',
  border: 'solid 0px #ddd',
} as const;

const useStyles = makeStyles(() =>
  createStyles({
    textarea: {
      width: '100vw !important',
      height: '100% !important',
      marginBlockEnd: 'auto',
      border: 0,
      resize: 'none',
      backgroundColor: '#424242',
      color: 'white',
      borderColor: '#424242',
    },
    quickReply: {
      width: '50vw',
    },
  })
);

interface SelectedProps {
  selectedSession: Session | undefined;
}

const subjectSearchText = new Subject<string>();

export default function Editor(selected: SelectedProps) {
  const { selectedSession } = selected;
  // 状态提升 设置当天聊天的消息 TODO: 保存到当前用户session的草稿箱
  const [tempTextMessage, setTempTextMessage] = useState<string>('');
  const dispatch = useDispatch();
  // 展示 快捷回复
  const [open, setOpen] = useState(true);
  const anchorRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const menuListRef = useRef<HTMLUListElement>(null);
  const classes = useStyles();
  const quickReplyList = useSelector(getSearchQuickReply);

  const mySelf = useSelector(getMyself);
  const { onErrorMsg } = useAlert();

  const momeSubject = useMemo(() => {
    return subjectSearchText.pipe(debounceTime(200)).subscribe({
      next: (it) => {
        dispatch(setQuickReplySearchText(it));
      },
    });
  }, [dispatch]);

  function setMessage(message: string) {
    setTempTextMessage(message);
    subjectSearchText.next(message);
  }

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
    if (mySelf.onlineStatus !== OnlineStatus.OFFLINE) {
      if (selectedSession && tempTextMessage !== '') {
        dispatch(
          sendTextMessage(selectedSession.conversation.userId, tempTextMessage)
        );
        setMessage('');
      }
    } else {
      onErrorMsg('当前用户不在线，无法发送消息');
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
    return () => {
      momeSubject.unsubscribe();
    };
  }, [momeSubject]);

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
                  <MenuItem disabled>按两次上下键选择 tab 取消选择</MenuItem>
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
          textMessage={tempTextMessage}
          setMessage={setMessage}
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
              placeholder="请输入消息..."
              onChange={handleTextChange}
              onKeyDown={setFocusToQuickReplyMenu}
              value={tempTextMessage}
              minRows={3}
              disabled={
                // 如果会话是因为转接结束的，就不能再发消息
                Boolean(selectedSession.conversation.endTime) &&
                [CloseReason.TRANSLATE, CloseReason.ADMIN_TAKE_OVER].includes(
                  selectedSession.conversation.closeReason ??
                    CloseReason.USER_LEFT
                )
              }
            />
            <Button
              // 是否可用，通过 TextareaAutosize 判断
              disabled={tempTextMessage === ''}
              variant="contained"
              color="primary"
              endIcon={<Icon>send</Icon>}
              onClick={handleSendTextMessage}
            >
              发送
            </Button>
            <Button
              style={{ minWidth: 50 }}
              variant="outlined"
              onClick={escNode}
            >
              关闭
            </Button>
          </>
        )}
      </div>
    </>
  );
}
