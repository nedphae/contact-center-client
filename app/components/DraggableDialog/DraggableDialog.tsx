/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Object } from 'ts-toolbelt';

import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Draggable from 'react-draggable';
import Paper, { PaperProps } from '@material-ui/core/Paper';

function PaperComponent(props: PaperProps) {
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
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          取消
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default forwardRef<DraggableDialogRef, Props>(DraggableDialog);
