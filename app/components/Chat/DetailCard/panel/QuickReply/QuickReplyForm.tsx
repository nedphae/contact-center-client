import React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Object } from 'ts-toolbelt';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Checkbox,
  DialogActions,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import Button from 'app/components/CustomButtons/Button';
import { useMutation } from '@apollo/client';
import {
  MUTATION_QUICK_REPLY,
  MUTATION_QUICK_REPLY_GROUP,
} from 'app/domain/graphql/QuickReply';
import { QuickReply, QuickReplyGroup } from 'app/domain/Chat';
import SubmitButton from 'app/components/Form/SubmitButton';

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

type QuickReplyFormProps = Object.Merge<
  {
    defaultValues?: QuickReply;
    quickReplyGroup: QuickReplyGroup[];
  },
  DefaultFormProps
>;

type QuickReplyGroupFormProps = Object.Merge<
  {
    defaultValues?: QuickReplyGroup;
  },
  DefaultFormProps
>;

export function QuickReplyForm(props: QuickReplyFormProps) {
  const { open, handleClose, defaultValues, refetch, quickReplyGroup } = props;
  const { handleSubmit, register, control, errors } = useForm<QuickReply>({
    defaultValues,
  });

  const [addQuickReply, { loading, data }] =
    useMutation<QuickReplyGraphql>(MUTATION_QUICK_REPLY);

  const onSubmit: SubmitHandler<QuickReply> = async (form) => {
    addQuickReply({ variables: { quickReplyInput: form } });
    handleClose();
    refetch();
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">添加话术</DialogTitle>
      <DialogContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField
            value={defaultValues?.id || ''}
            name="id"
            type="hidden"
            inputRef={register({ valueAsNumber: true })}
          />
          <Controller
            control={control}
            name="groupId"
            rules={{ valueAsNumber: true }}
            render={({ onChange, value }, { invalid }) => (
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
                  onChange={onChange}
                  value={value || ''}
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
                {invalid && <FormHelperText>Error</FormHelperText>}
              </FormControl>
            )}
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
            helperText={errors.title?.message}
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
            helperText={errors.content?.message}
            inputRef={register({
              maxLength: {
                value: 500,
                message: '话术内容长度不能大于500个字符',
              },
            })}
          />
          <Controller
            control={control}
            defaultValue
            name="personal"
            render={({ onChange, value }) => (
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
          <SubmitButton loading={loading} success={Boolean(data)} />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          取消
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function QuickReplyGroupForm(props: QuickReplyGroupFormProps) {
  const { open, handleClose, defaultValues, refetch } = props;
  const { handleSubmit, register, control, errors } = useForm<QuickReplyGroup>({
    defaultValues,
  });
  const [addQuickReplyGroup, { loading, data }] =
    useMutation<QuickReplyGroupGraphql>(MUTATION_QUICK_REPLY_GROUP);

  const onSubmit: SubmitHandler<QuickReplyGroup> = async (form) => {
    addQuickReplyGroup({ variables: { quickReplyGroupInput: form } });
    handleClose();
    refetch();
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">添加话术</DialogTitle>
      <DialogContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField
            value={defaultValues?.id || ''}
            name="id"
            type="hidden"
            inputRef={register({ valueAsNumber: true })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            autoFocus
            id="groupName"
            name="groupName"
            label="分组名称"
            error={errors.groupName && true}
            helperText={errors.groupName?.message}
            inputRef={register({
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
            render={({ onChange, value }) => (
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
          <SubmitButton loading={loading} success={Boolean(data)} />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          取消
        </Button>
      </DialogActions>
    </Dialog>
  );
}

QuickReplyForm.defaultProps = {
  defaultValues: undefined,
};

QuickReplyGroupForm.defaultProps = {
  defaultValues: undefined,
};
