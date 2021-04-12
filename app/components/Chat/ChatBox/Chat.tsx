/**
 * 聊天窗口设计
 */
import React, { useState } from 'react';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Resizable } from 're-resizable';

import Grid from '@material-ui/core/Grid';

import ChatHeader from './ChatHeader';
import MesageList from './MessageList';
import EditorTool from './EditorTool';
import Editor from './Editor';

const style = {
  display: 'flex',
  // alignItems: 'center',
  justifyContent: 'center',
  border: 'solid 1px #ddd',
  background: '#f0f0f0',
} as const;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      height: 140,
      width: 100,
    },
    control: {
      padding: theme.spacing(2),
    },
  })
);

export default function Chat() {
  const classes = useStyles();
  // 状态提升 设置当天聊天的消息
  const [textMessage, setMessage] = useState('');

  return (
    <Grid container className={classes.root}>
      <CssBaseline />
      <ChatHeader />
      <div
        style={{
          width: 'auto',
          height: '80vh',
          // 预留出 header 的位置, header 修改为 sticky，不用再预留位置
          paddingTop: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <Resizable
          style={style}
          defaultSize={{
            width: 'auto',
            height: '60vh',
          }}
          maxHeight="70vh"
          minHeight="30vh"
          enable={{
            top: false,
            right: false,
            bottom: true,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
        >
          <MesageList />
        </Resizable>
        {/* TODO: 需要把  EditorTool 和 Editor 这两个组件合并到一块，防止渲染 MessageList */}
        <EditorTool textMessage={textMessage} setMessage={setMessage} />
        <div
          style={{ ...style, width: 'auto', height: '100%', minHeight: '60px' }}
        >
          <Editor textMessage={textMessage} setMessage={setMessage} />
        </div>
      </div>
    </Grid>
  );
}
