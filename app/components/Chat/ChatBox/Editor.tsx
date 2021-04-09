import React from 'react';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

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

interface EditorProps {
  textMessage: string;
  setMessage(msg: string): void;
}

export default function Editor(props: EditorProps) {
  const classes = useStyles();
  const { textMessage, setMessage } = props;

  function handleTextChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value);
  }

  return (
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
  );
}
