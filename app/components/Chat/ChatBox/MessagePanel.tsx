import React from 'react';
import { useSelector } from 'react-redux';

import {
  getSelectedConstomer,
  getSelectedMessageList,
} from 'app/state/session/sessionAction';
import { getStaff } from 'app/state/staff/staffAction';
import MessageList from './MessageList';

const MessagePanel = () => {
  const messages = useSelector(getSelectedMessageList);
  const staff = useSelector(getStaff);
  const user = useSelector(getSelectedConstomer);

  return <MessageList messages={messages} staff={staff} user={user} />;
};

export default MessagePanel;
