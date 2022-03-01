/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import LockIcon from '@material-ui/icons/Lock';

import { PasswordChanger } from 'app/domain/StaffInfo';
import { gql, useMutation } from '@apollo/client';
import useAlert from 'app/hook/alert/useAlert';
import { Divider } from '@material-ui/core';
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

interface FormProps {
  id: number;
}

interface Graphql {
  changePassword: boolean | undefined;
}

const MUTATION_STAFF_PASSWORD = gql`
  mutation ChangePassword($passwordChanger: PasswordChangerInput!) {
    changePassword(passwordChanger: $passwordChanger)
  }
`;

type PasswordChangerWithRepeat = Object.Merge<
  PasswordChanger,
  { password_repeat?: string }
>;

export default function ChangePasswordForm(props: FormProps) {
  const { id } = props;
  const classes = useStyles();
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<PasswordChangerWithRepeat>({
    defaultValues: { id },
  });

  const password = watch('newPassword');

  const { onLoadding, onCompleted, onError } = useAlert();
  const [changePassword, { loading }] = useMutation<Graphql>(
    MUTATION_STAFF_PASSWORD,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<PasswordChanger> = (form) => {
    changePassword({ variables: { passwordChanger: form } });
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={id}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="oldPassword"
          type="password"
          label="旧密码"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
          {...register('oldPassword')}
        />
        <Divider />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="newPassword"
          type="password"
          label="新密码"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
          error={errors.newPassword && true}
          helperText={errors.newPassword?.message}
          {...register('newPassword', {
            maxLength: {
              value: 50,
              message: '密码不能大于50位',
            },
            minLength: {
              value: 8,
              message: '密码至少8位',
            },
            pattern: {
              value: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,50}$/,
              message: '密码必须包含 数字、字母、特殊字符 中两种或以上',
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="password_repeat"
          type="password"
          label="确认密码"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
          error={errors.password_repeat && true}
          helperText={errors.password_repeat?.message}
          {...register('password_repeat', {
            validate: (value) => value === password || '密码不相符',
          })}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
