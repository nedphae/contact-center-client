import React, { useState } from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

export default function BotMenu() {
  return (
    <div
      onContextMenu={handleContextMenuClose}
      style={{ cursor: 'context-menu' }}
    >
      {/* 右键菜单 */}
      <Menu
        keepMounted
        open={contextMenu.mouseY !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu.mouseY !== null && contextMenu.mouseX !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {state.topicOrKnowladgeKey === 'Knowladge' && [
          <MenuItem key="interrelateBot" onClick={interrelateBot}>
            关联机器人
          </MenuItem>,
          <MenuItem
            key="editTopicOrKnowladge"
            onClick={() => {
              editTopicOrKnowladge('Knowladge');
            }}
          >
            修改知识库
          </MenuItem>,
        ]}
        {state.topicOrKnowladgeKey === 'Topic' && (
          <MenuItem
            onClick={() => {
              editTopicOrKnowladge('Topic');
            }}
          >
            修改知识分类
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}
