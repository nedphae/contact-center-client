/* eslint-disable react/jsx-props-no-spreading */
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import LockIcon from '@material-ui/icons/Lock';

import { PasswordChanger } from 'renderer/domain/StaffInfo';
import { gql, useMutation } from '@apollo/client';
import useAlert from 'renderer/hook/alert/useAlert';
import { Button, Divider } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
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
  const { t } = useTranslation();

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<PasswordChangerWithRepeat>({
    defaultValues: { id },
    shouldUnregister: false,
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
    onLoadding('Saving');
  }

  const onSubmit: SubmitHandler<PasswordChanger> = (form) => {
    changePassword({
      variables: { passwordChanger: _.omit(form, 'password_repeat') },
    });
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off">
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
          label={t('Old Password')}
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
          label={t('New Password')}
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
              message: t(
                'Password length cannot be greater than 50 characters'
              ),
            },
            minLength: {
              value: 8,
              message: t('Password length must be at least 8 characters'),
            },
            pattern: {
              value: /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,50}$/,
              message: t(
                'Password must contain two or more of numbers, letters and special characters'
              ),
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="password_repeat"
          type="password"
          label={t('Confirm Password')}
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
            validate: (value) =>
              value === password || t('Password does not match'),
          })}
        />
        <div className={classes.wrapper}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            // type="submit"
            onClick={handleSubmit(onSubmit)}
          >
            {t('Save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
