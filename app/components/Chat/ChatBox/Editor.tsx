import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import {
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

import {
  sendImageMessage,
  sendTextMessage,
} from 'app/state/session/sessionAction';
import { PhotoContent } from 'app/domain/Message';
import {
  getSearchQuickReply,
  getSearchText,
  setQuickReplySearchText,
} from 'app/state/chat/chatAction';
import EditorTool from './EditorTool';

const style = {
  display: 'flex',
  // alignItems: 'center',
  justifyContent: 'center',
  border: 'solid 1px #ddd',
  background: '#f0f0f0',
} as const;

const useStyles = makeStyles(() =>
  createStyles({
    textarea: {
      width: '100vw !important',
      height: '100% !important',
      marginBlockEnd: 'auto',
      border: 0,
      resize: 'none',
    },
  })
);

interface SelectedProps {
  selectedSession: number | undefined;
}

export default function Editor(selected: SelectedProps) {
  const { selectedSession } = selected;
  // 状态提升 设置当天聊天的消息 TODO: 保存到当前用户session的草稿箱
  const textMessage = useSelector(getSearchText);
  const dispath = useDispatch();
  // 展示 快捷回复
  const [open, setOpen] = useState(true);
  const anchorRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  const menuListRef = useRef<HTMLUListElement>(null);
  const classes = useStyles();
  const quickReplyList = useSelector(getSearchQuickReply);

  function setMessage(message: string) {
    dispath(setQuickReplySearchText(message));
  }

  const filterQuickReplyList = quickReplyList?.filter(
    (it) => it.content !== textMessage
  );

  const shouldOpen = Boolean(
    filterQuickReplyList && filterQuickReplyList.length > 0
  );

  function handleTextChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setOpen(true);
    setMessage(event.target.value);
  }

  function handleSendTextMessage() {
    if (selectedSession && textMessage !== '') {
      dispath(sendTextMessage(selectedSession, textMessage));
      setMessage('');
    }
  }

  function handleSendImageMessage(photoContent: PhotoContent) {
    if (selectedSession) {
      dispath(sendImageMessage(selectedSession, photoContent));
    }
  }

  function setFocusToQuickReplyMenu(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      menuListRef.current?.focus();
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

  return (
    <>
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
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  id="menu-list-grow"
                  onKeyDown={handleListKeyDown}
                  ref={menuListRef}
                >
                  <MenuItem disabled>
                    按两次上下键选择 esc/tab 取消选择
                  </MenuItem>
                  {quickReplyList &&
                    quickReplyList.map((quickReply) => (
                      <MenuItem
                        key={quickReply.id}
                        onClick={handleSelectItem(quickReply.content)}
                      >
                        {`[${quickReply.title}]: ${quickReply.content}`}
                      </MenuItem>
                    ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {/* TODO: 需要把  EditorTool 和 Editor 这两个组件合并到一块，防止渲染 MessageList */}
      {selectedSession && (
        <EditorTool
          ref={anchorRef}
          textMessage={textMessage}
          setMessage={setMessage}
          sendImageMessage={handleSendImageMessage}
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
              value={textMessage}
              minRows={2}
            />
            <Button
              // 是否可用，通过 TextareaAutosize 判断
              disabled={textMessage === ''}
              variant="contained"
              color="primary"
              endIcon={<Icon>send</Icon>}
              onClick={handleSendTextMessage}
            >
              Send
            </Button>
            <Button style={{ minWidth: 50 }} variant="outlined">
              关闭
            </Button>
          </>
        )}
      </div>
    </>
  );
}
