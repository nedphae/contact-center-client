import React from 'react';

import { Avatar } from '@material-ui/core';
import WebIcon from '@material-ui/icons/Web';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';
import AndroidIcon from '@material-ui/icons/Android';
import { Icon } from '@iconify/react';
import wechatIcon from '@iconify/icons-mdi/wechat';
import weiboFill from '@iconify-icons/ri/weibo-fill';

import { CustomerStatus } from 'renderer/domain/Customer';

interface UserHeaderProps {
  status: CustomerStatus;
}

function createUserAvatar(status: CustomerStatus) {
  let result;
  switch (status.fromType) {
    case 'WEB': {
      result = <WebIcon />;
      break;
    }
    case 'IOS': {
      result = <PhoneIphoneIcon />;
      break;
    }
    case 'ANDROID': {
      result = <AndroidIcon />;
      break;
    }
    case 'WX_MA':
    case 'WX': {
      result = <Icon icon={wechatIcon} />;
      break;
    }
    case 'WB': {
      result = <Icon icon={weiboFill} />;
      break;
    }
    default: {
      result = <AccountCircleIcon />;
      break;
    }
  }
  return result;
}

export default function UserHeader(props: UserHeaderProps) {
  const { status } = props;
  return <Avatar alt="Profile Picture">{createUserAvatar(status)}</Avatar>;
}
