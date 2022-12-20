/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Object } from 'ts-toolbelt';

import {
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core/styles';
import MuiDialogTitle, {
  DialogTitleProps as DefaultDialogTitleProps,
} from '@material-ui/core/DialogTitle';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Draggable from 'react-draggable';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import { Typography, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Paper {...props} />
    </Draggable>
  );
}

export interface DialogTitleProps
  extends WithStyles<typeof styles>,
    Object.Omit<DefaultDialogTitleProps, 'classes'> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

export const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

interface Props extends Object.Omit<DialogProps, 'open' | 'title'> {
  title: React.ReactNode;
  children: React.ReactNode;
}

export interface DraggableDialogRef {
  setOpen: (state: boolean) => void;
}

function DraggableDialog(props: Props, ref: React.Ref<DraggableDialogRef>) {
  const { title, children, ...otherProps } = props;
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleDialogClose = (
    _: unknown,
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason !== 'backdropClick') {
      handleClose();
    }
  };

  useImperativeHandle(ref, () => ({
    setOpen: (state: boolean) => {
      setOpen(state);
    },
  }));

  return (
    <Dialog
      disableEnforceFocus
      {...otherProps}
      onClose={handleDialogClose}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      open={open}
    >
      <DialogTitle
        id="draggable-dialog-title"
        style={{ cursor: 'move' }}
        onClose={handleClose}
      >
        {title}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

export default forwardRef<DraggableDialogRef, Props>(DraggableDialog);
