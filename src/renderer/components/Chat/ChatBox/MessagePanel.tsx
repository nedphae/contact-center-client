import { useSelector } from 'react-redux';

import { getSelectedMessageList } from 'renderer/state/session/sessionAction';
import { getStaff } from 'renderer/state/staff/staffAction';
import {
  getSelectedConstomer,
  getSelectedSession,
} from 'renderer/state/chat/chatAction';
import MessageList from './MessageList';

const MessagePanel = () => {
  const messages = useSelector(getSelectedMessageList);
  const staff = useSelector(getStaff);
  const user = useSelector(getSelectedConstomer);
  const session = useSelector(getSelectedSession);

  return (
    <MessageList
      session={session}
      messages={messages}
      staff={staff}
      user={user}
      loadMore
    />
  );
};

export default MessagePanel;
