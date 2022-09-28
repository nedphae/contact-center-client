import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PropTypes from 'prop-types';

import { GridMenu } from '@material-ui/data-grid';
import { Badge, Button, MenuItem, MenuList } from '@material-ui/core';
import ViewListIcon from '@material-ui/icons/ViewList';

export interface GridToolbarDataProps {
  newButtonClick?: () => void;
  deleteButtonClick?: () => void;
  refetch?: () => void;
}

export const GridToolbarDataButton = forwardRef<
  HTMLButtonElement,
  GridToolbarDataProps
>(function GridToolbarDataButton(props, ref) {
  const { newButtonClick, deleteButtonClick, refetch } = props;
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(undefined);
  const handleNew = () => {
    // 打开新增接口
    if (newButtonClick) {
      newButtonClick();
    }
    setAnchorEl(undefined);
  };

  const handleDelete = () => {
    // 打开新增接口
    if (deleteButtonClick) {
      deleteButtonClick();
    }
    setAnchorEl(undefined);
  };

  const handleRefetch = () => {
    // 打开新增接口
    if (refetch) {
      refetch();
    }
    setAnchorEl(undefined);
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
    }
    if (event.key === 'Tab' || event.key === 'Escape') {
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
        aria-label="data"
        aria-haspopup="menu"
      >
        {t('Data')}
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
          {refetch && (
            <MenuItem onClick={handleRefetch}>{t('Refresh')}</MenuItem>
          )}
          {newButtonClick && (
            <MenuItem onClick={handleNew}>{t('New')}</MenuItem>
          )}
          {deleteButtonClick && (
            <MenuItem onClick={handleDelete}>{t('Delete')}</MenuItem>
          )}
        </MenuList>
      </GridMenu>
    </>
  );
});

GridToolbarDataButton.propTypes = {
  newButtonClick: PropTypes.func,
  deleteButtonClick: PropTypes.func,
  refetch: PropTypes.func,
};

GridToolbarDataButton.defaultProps = {
  newButtonClick: undefined,
  deleteButtonClick: undefined,
  refetch: undefined,
};
