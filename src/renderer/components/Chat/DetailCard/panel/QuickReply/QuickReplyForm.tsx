/* eslint-disable react/jsx-props-no-spreading */
import _ from 'lodash';
import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
} from 'renderer/domain/graphql/QuickReply';
import { QuickReply, QuickReplyGroup } from 'renderer/domain/Chat';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import useAlert from 'renderer/hook/alert/useAlert';
import { DialogTitle } from 'renderer/components/DraggableDialog/DraggableDialog';

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
  const { t } = useTranslation();

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
        {t('Add Quick Reply')}
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
                <InputLabel id="demo-mutiple-chip-label">
                  {t('Group')}
                </InputLabel>
                <Select
                  labelId="groupId"
                  id="groupId"
                  // see https://github.com/react-hook-form/react-hook-form/issues/3963
                  onChange={(event) => {
                    const groupId = event.target.value as string;
                    onChange(groupId === '' || !groupId ? undefined : +groupId);
                  }}
                  value={value}
                  label={t('Group')}
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
            label={t('Quick reply title')}
            error={errors.title && true}
            helperText={errors.title?.message}
            {...register('title', {
              maxLength: {
                value: 80,
                message: t(
                  'Quick reply title length cannot be greater than 80 characters'
                ),
              },
            })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            id="content"
            label={t('Quick reply content')}
            error={errors.content && true}
            helperText={errors.content?.message}
            {...register('content', {
              maxLength: {
                value: 500,
                message: t(
                  'Quick reply content length cannot be greater than 500 characters'
                ),
              },
            })}
          />
          <Controller
            control={control}
            defaultValue
            name="personal"
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                )}
                label={t('Is personal')}
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
  const { t } = useTranslation();

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
        {t('Add Quick Reply Group')}
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
            label={t('Group Name')}
            error={errors.groupName && true}
            helperText={errors.groupName?.message}
            {...register('groupName', {
              maxLength: {
                value: 50,
                message: t(
                  'Group name length cannot be greater than 50 characters'
                ),
              },
            })}
          />
          <Controller
            control={control}
            defaultValue
            name="personal"
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                )}
                label={t('Is personal')}
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
