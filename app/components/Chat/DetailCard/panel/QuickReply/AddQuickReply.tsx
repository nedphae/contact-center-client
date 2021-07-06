import React, { useState } from 'react';
import {
  Controller,
  DeepMap,
  FieldError,
  RegisterOptions,
  SubmitHandler,
  useForm,
} from 'react-hook-form';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreIcon from '@material-ui/icons/MoreVert';
import { FormControlLabel, IconButton } from '@material-ui/core';

import { useMutation } from '@apollo/client';
import {
  MUTATION_QUICK_REPLY,
  MUTATION_QUICK_REPLY_GROUP,
} from 'app/domain/graphql/QuickReply';

interface FormValues {
  groupId: number | undefined;
  title: string;
  content: string;
  personal: boolean;
}
interface GroupFormValues {
  groupName: string;
  personal: boolean;
}

interface QuickReplyGraphql {
  addQuickReply: { id: number };
}
interface QuickReplyGroupGraphql {
  addQuickReplyGroup: { id: number };
}

function quickReplyForm(
  register: (arg0?: RegisterOptions) => React.Ref<unknown> | undefined,
  errors: DeepMap<FormValues, FieldError>
) {
  return (
    <>
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        id="groupId"
        name="groupId"
        label="分组"
        inputRef={register({ valueAsNumber: true })}
      />
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        autoFocus
        id="title"
        name="title"
        label="话术标题"
        error={errors.title && true}
        helperText={errors.title}
        inputRef={register({
          maxLength: {
            value: 80,
            message: '话术标题长度不能大于80个字符',
          },
        })}
      />
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        id="content"
        name="content"
        label="话术内容"
        error={errors.content && true}
        helperText={errors.content}
        inputRef={register({
          maxLength: {
            value: 500,
            message: '话术内容长度不能大于500个字符',
          },
        })}
      />
    </>
  );
}

function quickReplyGroupForm(
  register: (arg0?: RegisterOptions) => React.Ref<unknown> | undefined,
  errors: DeepMap<GroupFormValues, FieldError>
) {
  return (
    <>
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        autoFocus
        id="groupName"
        name="groupName"
        label="分组名称"
        error={errors.groupName && true}
        helperText={errors.groupName}
        inputRef={register({
          maxLength: {
            value: 50,
            message: '分组名称长度不能大于50个字符',
          },
        })}
      />
    </>
  );
}
const ITEM_HEIGHT = 48;

type Form = FormValues | GroupFormValues;

export default function AddQuickReply() {
  const [group, setGroup] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const { register, handleSubmit, control, errors } = useForm<Form>();
  const [open, setOpen] = React.useState<boolean>(false);
  const [addQuickReply, quickReplyResult] =
    useMutation<QuickReplyGraphql>(MUTATION_QUICK_REPLY);
  const [addQuickReplyGroup, quickReplyGroupResult] =
    useMutation<QuickReplyGroupGraphql>(MUTATION_QUICK_REPLY_GROUP);

  const handleClose = () => {
    setOpen(false);
  };

  if (open && (quickReplyResult.data || quickReplyGroupResult.data)) {
    setOpen(false);
  }

  const onSubmit: SubmitHandler<FormValues | GroupFormValues> = async (
    form
  ) => {
    if (group) {
      // 用户信息表单
      addQuickReplyGroup({ variables: { quickReplyGroupInput: form } });
    } else {
      addQuickReply({ variables: { quickReplyInput: form } });
    }
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
            width: '20ch',
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
          添加话术分组
        </MenuItem>
        <MenuItem
          onClick={() => {
            setGroup(false);
            handleMenuClose();
            setOpen(true);
          }}
        >
          添加话术
        </MenuItem>
      </Menu>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle id="form-dialog-title">添加话术</DialogTitle>
          <DialogContent>
            {group
              ? quickReplyGroupForm(register, errors)
              : quickReplyForm(register, errors)}
            <FormControlLabel
              control={
                <Controller
                  control={control}
                  defaultValue
                  name="personal"
                  render={({ onChange, value }) => (
                    <Checkbox
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                  )}
                />
              }
              label="是否个人"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              取消
            </Button>
            <Button type="submit" color="primary">
              提交
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
