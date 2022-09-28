import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreIcon from '@material-ui/icons/MoreVert';
import { IconButton } from '@material-ui/core';

import { QuickReplyDto } from 'renderer/domain/Chat';
import { QuickReplyForm, QuickReplyGroupForm } from './QuickReplyForm';

const ITEM_HEIGHT = 48;

interface AddQuickReplyProps {
  quickReplyDto: QuickReplyDto;
  refetch: () => void;
}

export default function AddQuickReply(prop: AddQuickReplyProps) {
  const { quickReplyDto, refetch } = prop;
  const { t } = useTranslation();

  const [group, setGroup] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);
  const openMenu = Boolean(anchorEl);
  const [open, setOpen] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(undefined);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <IconButton edge="end" color="inherit" onClick={handleClick}>
        <MoreIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setGroup(true);
            handleMenuClose();
            setOpen(true);
          }}
        >
          {t('Add Quick Reply Group')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setGroup(false);
            handleMenuClose();
            setOpen(true);
          }}
        >
          {t('Add Quick Reply')}
        </MenuItem>
      </Menu>
      {group ? (
        <QuickReplyGroupForm
          open={open}
          handleClose={handleClose}
          refetch={refetch}
        />
      ) : (
        <QuickReplyForm
          open={open}
          handleClose={handleClose}
          refetch={refetch}
          quickReplyGroup={quickReplyDto.withGroup ?? []}
        />
      )}
    </div>
  );
}
