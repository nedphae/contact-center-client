import { useSelector } from 'react-redux';

import { getSelectedMessageList } from 'renderer/state/session/sessionAction';
import { getStaff } from 'renderer/state/staff/staffAction';
import {
  getMonitor,
  getSelectedConstomer,
  getSelectedSession,
} from 'renderer/state/chat/chatAction';
import useMonitorUserAndMsg from 'renderer/hook/init/useMonitorUserAndMsg';
import MessageList from './MessageList';

const MessagePanel = () => {
  const messages = useSelector(getSelectedMessageList);
  const staff = useSelector(getStaff);
  const user = useSelector(getSelectedConstomer);
  const session = useSelector(getSelectedSession);
  const monitorSession = useSelector(getMonitor);
  const [monitorMsg] = useMonitorUserAndMsg(1000);

  const showMsg = (monitorSession ? monitorMsg : messages) ?? [];
  return (
    <MessageList
      session={session}
      messages={showMsg}
      staff={staff}
      user={user}
    />
  );
};

export default MessagePanel;
