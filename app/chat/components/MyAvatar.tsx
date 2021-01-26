import React from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import WebIcon from '@material-ui/icons/Web';
import FaceIcon from '@material-ui/icons/Face';
import AndroidIcon from '@material-ui/icons/Android';
import AppleIcon from '@material-ui/icons/Apple';
import PublicIcon from '@material-ui/icons/Public';
import { Icon } from '@iconify/react';
import wechatIcon from '@iconify-icons/mdi/wechat';
import sinaWeibo from '@iconify-icons/mdi/sina-weibo';

import { FromType } from 'app/domain/constant/Conversation';

interface AvatarProps {
  /** 来源类型 */
  fromType: FromType;
}

function getIconFromType(fromType: FromType) {
  switch (+fromType) {
    case FromType.WEB:
      return <WebIcon />;
    case FromType.IOS:
      return <AppleIcon />;
    case FromType.ANDROID:
      return <AndroidIcon />;
    case FromType.WX:
    case FromType.WX_MA:
      return <Icon icon={wechatIcon} />;
    case FromType.WB:
      return <Icon icon={sinaWeibo} />;
    case FromType.OPEN:
      return <PublicIcon />;
    default:
      return <FaceIcon />;
  }
}

/**
 * 设置头像尺寸
 */
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  }),
);

function MyAvatar(props: AvatarProps) {
  const { fromType } = props;

  return <Avatar>{getIconFromType(fromType)}</Avatar>;
}

export default MyAvatar;
