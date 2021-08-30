import React from 'react';
import { useSelector } from 'react-redux';

import {
  getSelectedConstomer,
  getSelectedMessageList,
} from 'app/state/session/sessionAction';
import { getStaff } from 'app/state/staff/staffAction';
import { getSelectedSession } from 'app/state/chat/chatAction';
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
