import React, { useState } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import { IconButton, Toolbar } from '@material-ui/core';

import { TopicOrKnowladgeKey } from './TopicAndKnowladgeContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolBar: {
      minHeight: 30,
      background: 'white',
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
  newTopicOrKnowladge: (name: TopicOrKnowladgeKey) => void;
}
export default function BotToolbar(props: BotToolbarProps) {
  const { newTopicOrKnowladge } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            newTopicOrKnowladge('Knowladge');
            handleMenuClose();
          }}
        >
          添加知识库
        </MenuItem>
        <MenuItem
          onClick={() => {
            newTopicOrKnowladge('Topic');
            handleMenuClose();
          }}
        >
          添加知识库分类
        </MenuItem>
      </Menu>
    </Toolbar>
  );
}
