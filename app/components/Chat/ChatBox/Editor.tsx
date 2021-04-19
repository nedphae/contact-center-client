import React, { useState } from 'react';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

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
  const [textMessage, setMessage] = useState('');
  const classes = useStyles();

  function handleTextChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value);
  }

  return (
    <>
      {/* TODO: 需要把  EditorTool 和 Editor 这两个组件合并到一块，防止渲染 MessageList */}
      {selectedSession && (
        <EditorTool textMessage={textMessage} setMessage={setMessage} />
      )}
      <div
        style={{ ...style, width: 'auto', height: '100%', minHeight: '60px' }}
      >
        {selectedSession && (
          <>
            <TextareaAutosize
              className={classes.textarea}
              aria-label="maximum height"
              placeholder="请输入消息..."
              onChange={handleTextChange}
              value={textMessage}
              rowsMin={2}
            />
            <Button
              // 是否可用，通过 TextareaAutosize 判断
              disabled={textMessage === ''}
              variant="contained"
              color="primary"
              endIcon={<Icon>send</Icon>}
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
