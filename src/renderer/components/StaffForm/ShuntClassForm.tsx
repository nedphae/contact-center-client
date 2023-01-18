/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from 'react-i18next';

import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler } from 'react-hook-form';

import { useMutation } from '@apollo/client';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import GroupIcon from '@material-ui/icons/Group';

import { ShuntClass } from 'renderer/domain/StaffInfo';
import {
  SaveShuntClassGraphql,
  MUTATION_SHUNT_CLASS,
} from 'renderer/domain/graphql/Staff';
import useAlert from 'renderer/hook/alert/useAlert';
import SubmitButton from '../Form/SubmitButton';

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  })
);

// 去除掉没用的循环属性
type FormType = Object.Omit<ShuntClass, 'children'>;

interface FormProps {
  defaultValues: FormType | undefined;
}

export default function ShuntClassForm(props: FormProps) {
  const { defaultValues } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const { handleSubmit, register } = useForm<FormType>({
    defaultValues,
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveShuntClass, { loading, data }] =
    useMutation<SaveShuntClassGraphql>(MUTATION_SHUNT_CLASS, {
      onCompleted,
      onError,
    });
  if (loading) {
    onLoadding('Saving');
  }

  const onSubmit: SubmitHandler<FormType> = (form) => {
    saveShuntClass({ variables: { shuntClass: form } });
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveShuntClass.id || ''}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />
        <TextField
          value={1}
          type="hidden"
          {...register('catalogue', { valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="className"
          label={t('KB Category name')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          {...register('className', {
            required: t('Category name must be set'),
            maxLength: {
              value: 50,
              message: t('Category name cannot exceed 50 characters'),
            },
          })}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
