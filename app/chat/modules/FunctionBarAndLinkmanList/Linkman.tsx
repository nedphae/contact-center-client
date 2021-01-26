import React from 'react';
import { useSelector } from 'react-redux';

import { FromType } from 'app/domain/constant/Conversation';
import MyAvatar from '../../components/MyAvatar';
import Time from '../../../utils/time';
import { RootState } from '../../../store';
import useAction from '../../hooks/useAction';
import { isMobile } from '../../../utils/ua';

import Style from './Linkman.less';
import useAero from '../../hooks/useAero';

interface LinkmanProps {
  id: number;
  name: string;
  fromType: FromType;
  /** 消息预览 */
  preview: string;
  unread: number;
  time: Date;
}

function Linkman(props: LinkmanProps) {
  const { id, name, fromType, preview, unread, time } = props;

  const action = useAction();
  const focus = useSelector((state: RootState) => state.chat.focus);
  const aero = useAero();

  function formatTime() {
    const nowTime = new Date();
    if (Time.isToday(nowTime, time)) {
      return Time.getHourMinute(time);
    }
    if (Time.isYesterday(nowTime, time)) {
      return '昨天';
    }
    return Time.getMonthDate(time);
  }

  function handleClick() {
    action.setFocus(id);
    if (isMobile) {
      action.setStatus('functionBarAndLinkmanListVisible', false);
    }
  }

  return (
    <div
      className={`${Style.linkman} ${id === focus ? Style.focus : ''}`}
      onClick={handleClick}
      role="button"
      {...aero}
    >
      <MyAvatar fromType={fromType} />
      <div className={Style.container}>
        <div className={`${Style.rowContainer} ${Style.nameTimeBlock}`}>
          <p className={Style.name}>{name}</p>
          <p className={Style.time}>{formatTime()}</p>
        </div>
        <div className={`${Style.rowContainer} ${Style.previewUnreadBlock}`}>
          <p
            className={Style.preview}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: preview }}
          />
          {unread > 0 ? (
            <div className={Style.unread}>
              <span>{unread}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Linkman;
