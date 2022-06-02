/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import _ from 'lodash';
import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  FormControlLabel,
  Checkbox,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import {
  MUTATION_QUICK_REPLY,
  MUTATION_QUICK_REPLY_GROUP,
} from 'app/domain/graphql/QuickReply';
import { QuickReply, QuickReplyGroup } from 'app/domain/Chat';
import SubmitButton from 'app/components/Form/SubmitButton';
import useAlert from 'app/hook/alert/useAlert';
import { DialogTitle } from 'app/components/DraggableDialog/DraggableDialog';

interface QuickReplyGraphql {
  addQuickReply: { id: number };
}
interface QuickReplyGroupGraphql {
  addQuickReplyGroup: { id: number };
}

interface DefaultFormProps {
  open: boolean;
  handleClose: () => void;
  refetch: () => void;
}

// 去除掉没用的循环属性
type FormType = Object.Omit<QuickReply, 'group'>;

type QuickReplyFormProps = Object.Merge<
  {
    defaultValues?: FormType;
    quickReplyGroup: QuickReplyGroup[];
  },
  DefaultFormProps
>;

export function QuickReplyForm(props: QuickReplyFormProps) {
  const { open, handleClose, defaultValues, refetch, quickReplyGroup } = props;
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues,
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [addQuickReply, { loading }] = useMutation<QuickReplyGraphql>(
    MUTATION_QUICK_REPLY,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<FormType> = async (form) => {
    await addQuickReply({
      variables: { quickReplyInput: _.omit(form, '__typename') },
    });
    await refetch();
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" onClose={handleClose}>
        添加快捷回复
      </DialogTitle>
      <DialogContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField
            value={defaultValues?.id || ''}
            type="hidden"
            {...register('id', { valueAsNumber: true })}
          />
          <Controller
            control={control}
            name="groupId"
            defaultValue={undefined}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error: groupIdError },
            }) => (
              <FormControl
                variant="outlined"
                margin="normal"
                fullWidth
                error={invalid}
              >
                <InputLabel id="demo-mutiple-chip-label">分组</InputLabel>
                <Select
                  labelId="groupId"
                  id="groupId"
                  // see https://github.com/react-hook-form/react-hook-form/issues/3963
                  onChange={(event) => {
                    const groupId = event.target.value as string;
                    onChange(groupId === '' || !groupId ? undefined : +groupId);
                  }}
                  value={value}
                  label="分组"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {quickReplyGroup &&
                    quickReplyGroup.map((it) => {
                      return (
                        <MenuItem key={it.id} value={it.id}>
                          {it.groupName}
                        </MenuItem>
                      );
                    })}
                </Select>
                {invalid && (
                  <FormHelperText>{groupIdError?.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            autoFocus
            id="title"
            label="快捷回复标题"
            error={errors.title && true}
            helperText={errors.title?.message}
            {...register('title', {
              maxLength: {
                value: 80,
                message: '快捷回复标题长度不能大于80个字符',
              },
            })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            id="content"
            label="快捷回复内容"
            error={errors.content && true}
            helperText={errors.content?.message}
            {...register('content', {
              maxLength: {
                value: 500,
                message: '快捷回复内容长度不能大于500个字符',
              },
            })}
          />
          <Controller
            control={control}
            defaultValue
            name="personal"
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label="是否个人"
              />
            )}
          />
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}

type QuickReplyGroupFormType = Object.Omit<QuickReplyGroup, 'quickReply'>;

type QuickReplyGroupFormProps = Object.Merge<
  {
    defaultValues?: QuickReplyGroupFormType;
  },
  DefaultFormProps
>;

export function QuickReplyGroupForm(props: QuickReplyGroupFormProps) {
  const { open, handleClose, defaultValues, refetch } = props;
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<QuickReplyGroupFormType>({
    defaultValues,
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [addQuickReplyGroup, { loading }] = useMutation<QuickReplyGroupGraphql>(
    MUTATION_QUICK_REPLY_GROUP,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<QuickReplyGroupFormType> = async (form) => {
    await addQuickReplyGroup({
      variables: {
        quickReplyGroupInput: _.omit(form, '__typename', 'quickReply'),
      },
    });
    await refetch();
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" onClose={handleClose}>
        添加快捷回复分组
      </DialogTitle>
      <DialogContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField
            value={defaultValues?.id || ''}
            type="hidden"
            {...register('id', { valueAsNumber: true })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            autoFocus
            id="groupName"
            label="分组名称"
            error={errors.groupName && true}
            helperText={errors.groupName?.message}
            {...register('groupName', {
              maxLength: {
                value: 50,
                message: '分组名称长度不能大于50个字符',
              },
            })}
          />
          <Controller
            control={control}
            defaultValue
            name="personal"
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label="是否个人"
              />
            )}
          />
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}

QuickReplyForm.defaultProps = {
  defaultValues: undefined,
};

QuickReplyGroupForm.defaultProps = {
  defaultValues: undefined,
};
