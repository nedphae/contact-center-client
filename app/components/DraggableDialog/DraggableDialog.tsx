import React, { forwardRef, useImperativeHandle, useState } from 'react';

import Dialog from '@material-ui/core/Dialog';
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

interface Props {
  title: string;
  children: React.ReactNode;
  ref: React.Ref<DraggableDialogRef>;
}

export interface DraggableDialogRef {
  setOpen: (state: boolean) => void;
}

function DraggableDialog(props: Props) {
  const { title, children, ref } = props;
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    setOpen: (state: boolean) => {
      setOpen(state);
    },
  }));

  return (
    <Dialog
      disableEnforceFocus
      disableBackdropClick
      fullWidth
      maxWidth="lg"
      open={open}
      onClose={handleClose}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} color="primary">
          取消
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default forwardRef<DraggableDialogRef, Props>(DraggableDialog);
