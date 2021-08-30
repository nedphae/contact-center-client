import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HotKeys } from 'react-hotkeys';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

// 联通状态图标
import SyncAltIcon from '@material-ui/icons/SyncAlt';
// 离线状态
import SignalWifiOffIcon from '@material-ui/icons/SignalWifiOff';
// 重要标记
import StarIcon from '@material-ui/icons/Star';

import {
  clearMessgeBadge,
  getSession,
  hideSelectedSessionAndSetToLast,
  stickyCustomer,
  tagCustomer,
} from 'app/state/session/sessionAction';
import { OnlineStatus } from 'app/domain/constant/Staff';
import { Session, Tag } from 'app/domain/Session';
import {
  getSelectedSession,
  setSelectedSession,
} from 'app/state/chat/chatAction';
import { Message } from 'app/domain/Message';
import { MessageType } from 'app/domain/constant/Message';
import UserHeader from 'app/components/Header/UserHeader';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
    },
  })
);

interface SessionListProps {
  history?: boolean;
}

interface MenuState {
  userId: number | undefined;
  sticky: boolean;
  tag: 'important' | '' | undefined;
}

const initialState = {
  mouseX: undefined,
  mouseY: undefined,
};

function SessionList(props: SessionListProps) {
  const { history } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  // 默认不选取
  const selectedSession = useSelector(getSelectedSession);

  const [state, setState] = useState<{
    mouseX: undefined | number;
    mouseY: undefined | number;
  }>(initialState);
  const [menuState, setMenuState] = useState<MenuState>({
    userId: undefined,
    sticky: false,
    tag: undefined,
  });
  const sessions = useSelector(getSession(history));

  const handleContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    // 当前状态，根据当前状态生成菜单
    currentMenuState: MenuState
  ) => {
    event.preventDefault();
    setMenuState(currentMenuState);
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleClose = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setState(initialState);
  };

  const handleListItemClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    session: Session
  ) => {
    dispatch(setSelectedSession(session));
    dispatch(clearMessgeBadge(session.conversation.userId));
  };

  function doSticky(userId: number | undefined) {
    if (userId !== undefined) {
      dispatch(stickyCustomer(userId));
    }
    setState(initialState);
  }

  function doTag(userId: number | undefined, tag: Tag) {
    if (userId !== undefined) {
      dispatch(tagCustomer({ userId, tag })); // type TagParamer
    }
    setState(initialState);
  }

  /**
   * 根据状态生成右键菜单
   * @returns 右键菜单列表
   */
  function createMenuItem() {
    const menuList = [];
    if (!menuState.sticky) {
      menuList.push(
        <MenuItem key="sticky" onClick={() => doSticky(menuState.userId)}>
          置顶
        </MenuItem>
      );
    } else {
      menuList.push(
        <MenuItem key="sticky" onClick={() => doSticky(menuState.userId)}>
          取消置顶
        </MenuItem>
      );
    }
    if (menuState.tag === undefined) {
      menuList.push(
        <MenuItem
          key="important"
          onClick={() => doTag(menuState.userId, 'important')}
        >
          重要
        </MenuItem>
      );
    } else {
      menuList.push(
        <MenuItem
          key="clear"
          onClick={() => doTag(menuState.userId, undefined)}
        >
          清除标记
        </MenuItem>
      );
    }
    return menuList;
  }

  function getMessagePreview(message: Message): string {
    let previewText = ' ';
    switch (message.content.contentType) {
      case 'TEXT':
        previewText = message.content.textContent
          ? message.content.textContent.text
          : ' ';
        break;
      case 'SYS':
        break;
      default:
        previewText = MessageType[message.content.contentType];
        break;
    }
    return previewText;
  }

  const escNode = () => {
    if (selectedSession) {
      // esc 隐藏会话
      dispatch(
        hideSelectedSessionAndSetToLast(selectedSession.conversation.userId)
      );
    }
  };

  const handlers = {
    ESC_NODE: escNode,
  };

  return (
    <HotKeys handlers={handlers}>
      <div className={classes.root}>
        <List component="nav" aria-label="main mailbox folders">
          {sessions.map((session) => {
            const { conversation, unread, lastMessage, user, sticky, tag } =
              session;
            return (
              <React.Fragment key={conversation.id}>
                <ListItem
                  button
                  selected={
                    selectedSession?.conversation.userId === conversation.userId
                  }
                  onClick={(event) => handleListItemClick(event, session)}
                  // 右键菜单
                  onContextMenu={(event) =>
                    handleContextMenu(event, {
                      userId: conversation.userId,
                      sticky,
                      tag,
                    })
                  }
                >
                  <ListItemAvatar>
                    {/* badgeContent 未读消息 */}
                    <Badge badgeContent={unread} max={99} color="secondary">
                      {user && user.status && (
                        <UserHeader status={user.status} />
                      )}
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name === undefined ? user.uid : user.name}
                    secondary={
                      <Typography noWrap variant="body2" color="textSecondary">
                        {/* &nbsp;  用来充当占位符 如果没有消息时显示 TODO: 显示文本消息或者类型标注 */}
                        {lastMessage === undefined ? (
                          <>&nbsp;</>
                        ) : (
                          getMessagePreview(lastMessage)
                        )}
                      </Typography>
                    }
                  />
                  {tag === 'important' && <StarIcon />}
                  {user.status &&
                  OnlineStatus.ONLINE === user.status.onlineStatus ? (
                    <SyncAltIcon />
                  ) : (
                    <SignalWifiOffIcon />
                  )}
                </ListItem>
              </React.Fragment>
            );
          })}
          {/* 右键菜单 */}
          <div onContextMenu={handleClose} style={{ cursor: 'context-menu' }}>
            <Menu
              keepMounted
              open={state.mouseY !== undefined}
              onClose={handleClose}
              anchorReference="anchorPosition"
              anchorPosition={
                state.mouseY !== undefined && state.mouseX !== undefined
                  ? { top: state.mouseY, left: state.mouseX }
                  : undefined
              }
            >
              {createMenuItem()}
            </Menu>
          </div>
        </List>
      </div>
    </HotKeys>
  );
}

SessionList.defaultProps = {
  history: false,
};

export default SessionList;
