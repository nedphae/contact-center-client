/** ！
 * 咨询接待页面
 */
import React from 'react';
import { HotKeys } from 'react-hotkeys';

import ChatApp from '../../components/Chat/ChatApp';

const keyMap = {
  // 关闭当前会话(隐藏)
  ESC_NODE: 'esc',
  // 切换至等待时间最长的会话
  SWITCH_NODE: 'ctrl+tab',
};

export default function Entertain() {
  return (
    <HotKeys keyMap={keyMap}>
      <ChatApp />;
    </HotKeys>
  );
}
