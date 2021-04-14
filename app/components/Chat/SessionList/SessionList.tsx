import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

// 联通状态图标
import SyncAltIcon from '@material-ui/icons/SyncAlt';
// 离线状态
import SignalWifiOffIcon from '@material-ui/icons/SignalWifiOff';

import {
  getSession,
  stickyCustomer,
  tagCustomer,
} from 'app/state/session/sessionAction';
import { OnlineStatus } from 'app/domain/constant/Staff';
import { Tag } from 'app/domain/Session';
import {
  getSelectedSession,
  setSelectedSession,
} from 'app/state/chat/chatAction';

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
  mouseX: null,
  mouseY: null,
};

function SessionList(props: SessionListProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  // 默认不选取
  const selectedSession = useSelector(getSelectedSession);

  const [state, setState] = useState<{
    mouseX: null | number;
    mouseY: null | number;
  }>(initialState);
  const [menuState, setMenuState] = useState<MenuState>({
    userId: undefined,
    sticky: false,
    tag: undefined,
  });

  const { history } = props;
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
    index: number
  ) => {
    dispatch(setSelectedSession(index));
  };

  function doSticky(userId: number | undefined) {
    if (userId !== undefined) {
      dispatch(stickyCustomer(userId));
    }
  }

  function doTag(userId: number | undefined, tag: Tag) {
    if (userId !== undefined) {
      dispatch(tagCustomer({ userId, tag })); // type TagParamer
    }
  }

  /**
   * 根据状态生成右键菜单
   * @returns 右键菜单列表
   */
  function createMenuItem() {
    const menuList = [];
    if (!menuState.sticky) {
      menuList.push(
        <MenuItem onClick={() => doSticky(menuState.userId)}>置顶</MenuItem>
      );
    } else {
      menuList.push(
        <MenuItem onClick={() => doSticky(menuState.userId)}>取消置顶</MenuItem>
      );
    }
    if (menuState.tag === undefined) {
      menuList.push(
        <MenuItem onClick={() => doTag(menuState.userId, 'important')}>
          重要
        </MenuItem>
      );
    } else {
      menuList.push(
        <MenuItem onClick={() => doTag(menuState.userId, undefined)}>
          清除标记
        </MenuItem>
      );
    }
    return menuList;
  }

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="main mailbox folders">
        {sessions.map(
          ({ conversation, unread, lastMessage, user, sticky, tag }) => (
            <React.Fragment key={conversation.id}>
              <ListItem
                button
                selected={selectedSession === conversation.userId}
                onClick={(event) =>
                  handleListItemClick(event, conversation.userId)
                }
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
                    <Avatar />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name === undefined ? user.uid : user.name}
                  secondary={
                    <Typography noWrap variant="body2" color="textSecondary">
                      {/* &nbsp;  用来充当占位符 如果没有消息时显示 */}
                      {lastMessage === undefined ? '&nbsp;' : lastMessage}
                    </Typography>
                  }
                />
                {user.onlineStatue === OnlineStatus.ONLINE ? (
                  <SyncAltIcon />
                ) : (
                  <SignalWifiOffIcon />
                )}
              </ListItem>
            </React.Fragment>
          )
        )}
        {/* 右键菜单 */}
        <div onContextMenu={handleClose} style={{ cursor: 'context-menu' }}>
          <Menu
            keepMounted
            open={state.mouseY !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
              state.mouseY !== null && state.mouseX !== null
                ? { top: state.mouseY, left: state.mouseX }
                : undefined
            }
          >
            {createMenuItem()}
          </Menu>
        </div>
      </List>
    </div>
  );
}

SessionList.defaultProps = {
  history: false,
};

export default SessionList;
