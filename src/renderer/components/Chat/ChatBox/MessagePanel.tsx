import { useSelector } from 'react-redux';

import { getSelectedMessageList } from 'renderer/state/session/sessionAction';
import { getStaff } from 'renderer/state/staff/staffAction';
import {
  getMonitor,
  getSelectedConstomer,
} from 'renderer/state/chat/chatAction';
import useMonitorUserAndMsg from 'renderer/hook/data/useMonitorUserAndMsg';
import MessageList from './NewMessageList';

const MessagePanel = () => {
  const messages = useSelector(getSelectedMessageList);
  const staff = useSelector(getStaff);
  const user = useSelector(getSelectedConstomer);
  // const session = useSelector(getSelectedSession);
  const monitorSession = useSelector(getMonitor);
  const [monitorMsg] = useMonitorUserAndMsg(1000);

  const showMsg = (monitorSession ? monitorMsg : messages) ?? [];
  if (user) {
    return (
      <MessageList
        key={user.id}
        // session={session}
        messages={showMsg}
        staff={staff}
        user={user}
      />
    );
  }
  return <></>;
};

export default MessagePanel;
