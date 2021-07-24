import React, { forwardRef, useState } from 'react';

import PropTypes from 'prop-types';
import { GridMenu, isTabKey, isHideMenuKey } from '@material-ui/data-grid';
import { Badge, Button, MenuItem, MenuList } from '@material-ui/core';
import ViewListIcon from '@material-ui/icons/ViewList';

export interface GridToolbarDataProps {
  newButtonClick: () => void;
  deleteButtonClick?: () => void;
}

export const GridToolbarDataButton = forwardRef<
  HTMLButtonElement,
  GridToolbarDataProps
>(function GridToolbarDataButton(props, ref) {
  const { newButtonClick, deleteButtonClick } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNew = () => {
    // 打开新增接口
    newButtonClick();
    setAnchorEl(null);
  };

  const handleDelete = () => {
    // 打开新增接口
    if (deleteButtonClick) {
      deleteButtonClick();
    }
    setAnchorEl(null);
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (isTabKey(event.key)) {
      event.preventDefault();
    }
    if (isHideMenuKey(event.key)) {
      handleMenuClose();
    }
  };

  return (
    <>
      <Button
        ref={ref}
        color="primary"
        size="small"
        startIcon={
          <Badge badgeContent={0} color="primary">
            <ViewListIcon />
          </Badge>
        }
        onClick={handleMenuOpen}
        aria-expanded={anchorEl ? 'true' : undefined}
        aria-label="数据"
        aria-haspopup="menu"
      >
        数据
      </Button>
      <GridMenu
        open={Boolean(anchorEl)}
        target={anchorEl}
        onClickAway={handleMenuClose}
        position="bottom-start"
      >
        <MenuList
          className="MuiDataGrid-gridMenuList"
          onKeyDown={handleListKeyDown}
          autoFocusItem={Boolean(anchorEl)}
        >
          <MenuItem onClick={handleNew}>新建</MenuItem>
          {deleteButtonClick && (
            <MenuItem onClick={handleDelete}>新建</MenuItem>
          )}
        </MenuList>
      </GridMenu>
    </>
  );
});

GridToolbarDataButton.propTypes = {
  newButtonClick: PropTypes.func.isRequired,
  deleteButtonClick: PropTypes.func,
};

GridToolbarDataButton.defaultProps = {
  deleteButtonClick: undefined,
};
