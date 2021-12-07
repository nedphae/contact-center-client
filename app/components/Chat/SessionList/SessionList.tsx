import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
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
  setSelectedSession,
  stickyCustomer,
  tagCustomer,
} from 'app/state/session/sessionAction';
import { OnlineStatus } from 'app/domain/constant/Staff';
import { Session, Tag } from 'app/domain/Session';
import { getSelectedSession } from 'app/state/chat/chatAction';
import { Message } from 'app/domain/Message';
import { CreatorType, MessageType } from 'app/domain/constant/Message';
import UserHeader from 'app/components/Header/UserHeader';
import { InteractionLogo } from 'app/domain/constant/Conversation';
import { Chip } from '@material-ui/core';
import { getDuration, javaInstant2Num } from 'app/utils/timeUtils';
import useInterval from 'app/hook/useInterval';

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
  const sessions = useSelector(getSession(history));
  const [sessionDuration, setSessionDuration] = useState<{
    [sessionId: number]: number;
  }>();

  const [state, setState] = useState<{
    mouseX: undefined | number;
    mouseY: undefined | number;
  }>(initialState);
  const [menuState, setMenuState] = useState<MenuState>({
    userId: undefined,
    sticky: false,
    tag: undefined,
  });

  useInterval(
    () => {
      const durationList = sessions
        .filter((it) => Boolean(it.firstNeedReplyTime))
        .map((it) => {
          if (it.firstNeedReplyTime) {
            const createdAtTime = javaInstant2Num(it.firstNeedReplyTime);
            const timeDuration = Math.trunc(
              (new Date().getTime() - createdAtTime.getTime()) / 1000
            );
            return {
              [it.conversation.id]: timeDuration,
            };
          }
          return {};
        });
      setSessionDuration(_.defaults({}, ...durationList));
    },
    1000,
    true
  );

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
    dispatch(setSelectedSession(session.conversation.userId));
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

  function createLogo(interactionLogo: InteractionLogo) {
    let logo;
    switch (interactionLogo) {
      case InteractionLogo.NEW: {
        logo = <Chip label="新用户" size="small" />;
        break;
      }
      case InteractionLogo.UNREAD: {
        logo = <Chip label="未读" size="small" color="secondary" />;
        break;
      }
      case InteractionLogo.READ_UNREPLIE: {
        logo = <Chip label="已读未回" size="small" color="secondary" />;
        break;
      }
      case InteractionLogo.REPLIED: {
        logo = <Chip label="已读已回" size="small" color="primary" />;
        break;
      }
      default: {
        break;
      }
    }
    return logo;
  }

  return (
    <div className={classes.root}>
      <List dense>
        {sessions.map((session) => {
          const {
            conversation,
            unread,
            lastMessage,
            user,
            sticky,
            tag,
            interactionLogo,
          } = session;
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
                    {user && user.status && <UserHeader status={user.status} />}
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name === undefined ? user.uid : user.name}
                  secondary={
                    <Typography
                      noWrap
                      variant="caption"
                      color="textSecondary"
                      display="block"
                    >
                      {/* &nbsp;  用来充当占位符 如果没有消息时显示 TODO: 显示文本消息或者类型标注 */}
                      {lastMessage === undefined ? (
                        <>&nbsp;</>
                      ) : (
                        getMessagePreview(lastMessage)
                      )}
                    </Typography>
                  }
                />
                <small>
                  {createLogo(interactionLogo)}
                  <div>
                    {tag === 'important' && <StarIcon />}
                    {user.status &&
                    OnlineStatus.ONLINE === user.status.onlineStatus ? (
                      <SyncAltIcon />
                    ) : (
                      <SignalWifiOffIcon />
                    )}
                    <br />
                    {sessionDuration &&
                      sessionDuration[conversation.id] &&
                      getDuration(sessionDuration[conversation.id])}
                  </div>
                </small>
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
  );
}

SessionList.defaultProps = {
  history: false,
};

export default SessionList;
