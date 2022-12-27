/**
 * 聊天窗口界面，包括联系人列表，聊天窗口，用户信息窗口三部分组成
 * 使用 material-ui 重新设计UI，使与整体应用UI保持一致
 */

import { HotKeys } from 'react-hotkeys';
import Grid from '@material-ui/core/Grid';

import {
  hideSelectedSessionAndSetToLast,
  switchToLast,
} from 'renderer/state/session/sessionAction';
import { useAppDispatch } from 'renderer/store';
import SessionList from './SessionList/SessionPanel';
import Chat from './ChatBox/Chat';
import DetailCard from './DetailCard/DetailCard';

export default function ChatApp() {
  const dispatch = useAppDispatch();

  const escNode = () => {
    // esc 隐藏会话
    dispatch(hideSelectedSessionAndSetToLast());
  };

  const switchNode = () => {
    dispatch(switchToLast());
  };

  const handlers = {
    ESC_NODE: escNode,
    SWITCH_NODE: switchNode,
  };

  return (
    <HotKeys handlers={handlers}>
      <Grid container justifyContent="center" spacing={0}>
        <Grid item xs={12} md={3} xl={2}>
          <SessionList />
        </Grid>
        <Grid item xs={12} md={6} xl={7}>
          <Chat />
        </Grid>
        <Grid item xs={12} md={3} xl={3}>
          <DetailCard />
        </Grid>
      </Grid>
    </HotKeys>
  );
}
