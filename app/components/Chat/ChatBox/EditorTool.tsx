import React, { useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import InsertEmoticonOutlinedIcon from '@material-ui/icons/InsertEmoticonOutlined';
import AttachmentOutlinedIcon from '@material-ui/icons/AttachmentOutlined';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';
import LaunchOutlinedIcon from '@material-ui/icons/LaunchOutlined';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import StarIcon from '@material-ui/icons/Star';
import Tooltip from '@material-ui/core/Tooltip';
import Popper, { PopperPlacementType } from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import 'emoji-mart/css/emoji-mart.css';
import { Picker, BaseEmoji } from 'emoji-mart';

const useStyles = makeStyles(() =>
  createStyles({
    toolBar: {
      minHeight: 30,
      // 是否将按钮调中间
      // justifyContent: 'center',
    },
  })
);

interface EditorProps {
  textMessage: string;
  setMessage(msg: string): void;
}

export default function EditorTool(props: EditorProps) {
  const classes = useStyles();
  const { textMessage, setMessage } = props;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<PopperPlacementType>();

  const handleClick = (newPlacement: PopperPlacementType) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => placement !== newPlacement || !prev);
    setPlacement(newPlacement);
  };

  const onClose = () => setOpen(false);

  const addEmoji = (emojiData: BaseEmoji) => {
    const emoji = emojiData.native;
    setMessage(textMessage + emoji);
  };

  return (
    <Toolbar className={classes.toolBar}>
      <Popper open={open} anchorEl={anchorEl} placement={placement} transition>
        {() => (
          // { TransitionProps }
          // 不使用延迟
          // <Fade {...TransitionProps} timeout={350}>
          <ClickAwayListener onClickAway={onClose}>
            <Picker onSelect={addEmoji} title="emoji" />
          </ClickAwayListener>
          // </Fade>
        )}
      </Popper>
      <IconButton
        onClick={handleClick('top')}
        aria-label="emoji"
        disabled={false}
        color="primary"
        size="small"
      >
        <InsertEmoticonOutlinedIcon />
      </IconButton>
      <IconButton aria-label="upload file" size="small">
        <AttachmentOutlinedIcon />
      </IconButton>
      <IconButton color="secondary" aria-label="upload image" size="small">
        <ImageOutlinedIcon />
      </IconButton>
      <Tooltip title="转接">
        <IconButton color="primary" aria-label="transfer" size="small">
          <LaunchOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="邀请">
        <IconButton color="primary" aria-label="invite" size="small">
          <PersonAddOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="评价">
        <IconButton color="primary" aria-label="evaluate" size="small">
          <StarIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}
