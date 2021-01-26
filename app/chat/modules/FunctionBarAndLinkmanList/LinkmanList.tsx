import React from 'react';
import { useSelector } from 'react-redux';

import { getSession } from 'app/state/session/sessionAction';
import { Session } from 'app/domain/Session';
import { MessageType } from 'app/domain/constant/Message';
import LinkmanComponent from './Linkman';

import Style from './LinkmanList.less';

interface LinkmanListProps {
  history: boolean;
}

function LinkmanList(props: LinkmanListProps) {
  const { history } = props;
  const sessions = useSelector(getSession(history));

  function renderLinkman(session: Session) {
    const { conversation, user, lastMessage } = session;

    let preview = '暂无消息';
    if (lastMessage) {
      const contentType = MessageType[lastMessage.content.contentType];
      preview =
        contentType === MessageType.TEXT
          ? `${lastMessage.content.textContent?.text}`
          : `[${contentType}]`;
    }
    return (
      <LinkmanComponent
        key={conversation.id}
        id={conversation.id}
        name={user.name ?? user.uid}
        fromType={conversation.fromType}
        preview={preview}
        time={session.lastMessageTime}
        unread={session.unread}
      />
    );
  }

  return (
    <div className={Style.linkmanList}>
      {sessions.map((session) => renderLinkman(session))}
    </div>
  );
}

export default LinkmanList;
