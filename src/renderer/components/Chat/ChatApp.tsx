/**
 * 聊天窗口界面，包括联系人列表，聊天窗口，用户信息窗口三部分组成
 * 使用 material-ui 重新设计UI，使与整体应用UI保持一致
 */

import { useDispatch } from 'react-redux';

import { HotKeys } from 'react-hotkeys';
import Grid from '@material-ui/core/Grid';

import { hideSelectedSessionAndSetToLast } from 'renderer/state/session/sessionAction';
import SessionList from './SessionList/SessionPanel';
import Chat from './ChatBox/Chat';
import DetailCard from './DetailCard/DetailCard';


export default function ChatApp() {
  const dispatch = useDispatch();

  const escNode = () => {
    // esc 隐藏会话
    dispatch(hideSelectedSessionAndSetToLast());
  };

  const handlers = {
    ESC_NODE: escNode,
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
