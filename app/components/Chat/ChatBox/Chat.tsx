/**
 * 聊天窗口设计
 */
import React, { useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Resizable } from 're-resizable';

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

export default function Chat() {
  // 状态提升 设置当天聊天的消息
  const [textMessage, setMessage] = useState('');

  return (
    <>
      <CssBaseline />
      <div
        style={{
          width: 'auto',
          height: '100vh',
          // 预留出 header 的位置
          paddingTop: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <Resizable
          style={style}
          defaultSize={{
            width: 'auto',
            height: '70vh',
          }}
          maxHeight="75vh"
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
        <EditorTool textMessage={textMessage} setMessage={setMessage} />
        <div
          style={{ ...style, width: 'auto', height: '100%', minHeight: 'auto' }}
        >
          <Editor textMessage={textMessage} setMessage={setMessage} />
        </div>
      </div>
    </>
  );
}
