import React, { useState } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import { IconButton, Toolbar, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolBar: {
      minHeight: 30,
      background: '#2d2d2d',
      borderRightStyle: 'solid',
      borderLeftStyle: 'solid',
      borderWidth: 1,
      // 是否将按钮调中间
      // justifyContent: 'center',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
  })
);
interface BotToolbarProps {
  title: string;
  refetch: () => void;
  adderName: string;
  add: () => void;
  clearTopicCategorySelect: () => void;
}
export default function TreeToolbar(props: BotToolbarProps) {
  const { title, add, adderName, refetch, clearTopicCategorySelect } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(undefined);
  };

  return (
    <Toolbar className={classes.toolBar}>
      <IconButton
        edge="start"
        className={classes.menuButton}
        color="inherit"
        aria-label="menu"
        onClick={handleMenuClick}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6">{title}</Typography>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            refetch();
            handleMenuClose();
          }}
        >
          刷新
        </MenuItem>
        <MenuItem
          onClick={() => {
            add();
            handleMenuClose();
          }}
        >
          {adderName}
        </MenuItem>
        <MenuItem
          onClick={() => {
            clearTopicCategorySelect();
            handleMenuClose();
          }}
        >
          清除分类筛选
        </MenuItem>
      </Menu>
    </Toolbar>
  );
}
