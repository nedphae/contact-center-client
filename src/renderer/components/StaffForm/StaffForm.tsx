/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Object } from 'ts-toolbelt';
import _ from 'lodash';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { gql, useMutation, useQuery } from '@apollo/client';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import LockIcon from '@material-ui/icons/Lock';
import { InlineIcon } from '@iconify/react';
import noteLine from '@iconify-icons/clarity/note-line';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import {
  Avatar,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import Upload from 'rc-upload';

import Authorized from 'renderer/utils/Authorized';
import {
  getDownloadS3StaffImgPath,
  getUploadS3StaffPath,
} from 'renderer/config/clientConfig';
import Staff from 'renderer/domain/StaffInfo';
import {
  StaffGroupList,
  QUERY_GROUP,
  STAFF_FIELD,
} from 'renderer/domain/graphql/Staff';
import useAlert from 'renderer/hook/alert/useAlert';
import SubmitButton from '../Form/SubmitButton';
import DraggableDialog, {
  DraggableDialogRef,
} from '../DraggableDialog/DraggableDialog';
import ChangePasswordForm from './ChangePasswordForm';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
  defaultValues: Staff;
  mutationCallback?: (staff: Staff) => void | undefined;
}

interface Graphql {
  saveStaff: Staff;
}

const MUTATION_STAFF = gql`
  ${STAFF_FIELD}
  mutation Staff($staff: StaffInput!) {
    saveStaff(staff: $staff) {
      ...staffFields
    }
  }
`;

type StaffWithPassword = Object.Merge<
  Object.Omit<Staff, 'staffGroup'>,
  { password?: string; password_repeat?: string }
>;

export default function StaffForm(props: FormProps) {
  const { defaultValues, mutationCallback } = props;
  const { t } = useTranslation();

  const classes = useStyles();
  const refOfDialog = useRef<DraggableDialogRef>(null);

  const {
    handleSubmit,
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffWithPassword>({
    // 清除 password
    defaultValues: _.omit(defaultValues, 'password'),
    shouldUnregister: true,
  });
  const [uploading, setUploading] = useState<boolean>();
  const [error, setError] = useState<string>();

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveStaff, { loading }] = useMutation<Graphql>(MUTATION_STAFF, {
    onCompleted,
    onError,
  });
  if (loading) {
    onLoadding(loading);
  }
  const { data: groupData } = useQuery<StaffGroupList>(QUERY_GROUP);

  const groupList = groupData?.allStaffGroup;

  const password = watch('password');
  const avatar = watch('avatar');
  const staffType = watch('staffType');

  const imgUploadProps = useMemo(() => {
    return {
      action: getUploadS3StaffPath(),
      multiple: false,
      accept: 'image/*',
      onStart() {
        setUploading(true);
      },
      onSuccess(response: unknown) {
        setValue('avatar', (response as string[])[0]);
        setUploading(false);
      },
      onError(e: Error) {
        setUploading(false);
        setError(e.message);
      },
    };
  }, [setUploading, setError, setValue]);

  const onSubmit: SubmitHandler<StaffWithPassword> = async (form) => {
    const saveResult = await saveStaff({
      variables: {
        staff: _.omit(form, 'password_repeat', 'groupName', '__typename'),
      },
    });
    if (mutationCallback && saveResult.data?.saveStaff) {
      mutationCallback(saveResult.data?.saveStaff);
    }
  };

  const handleClose = (_event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(undefined);
  };

  return (
    <div className={classes.paper}>
      {uploading && <CircularProgress />}
      <Snackbar
        open={error !== undefined}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          {`${t('Upload failed')}:`}
          {error}
        </Alert>
      </Snackbar>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues.id || ''}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />
        <TextField type="hidden" {...register('avatar')} />
        <Upload {...imgUploadProps}>
          <Avatar
            alt="上传头像"
            src={avatar && `${getDownloadS3StaffImgPath()}${avatar}`}
          >
            {t('Avatar')}
          </Avatar>
        </Upload>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="username"
          label={t('Username')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          error={errors.username && true}
          helperText={errors.username?.message}
          {...register('username', {
            required: t('Username is required'),
            maxLength: {
              value: 50,
              message: t(
                'Username length cannot be greater than 50 characters'
              ),
            },
            minLength: {
              value: 4,
              message: t('Username must be at least 4 characters'),
            },
          })}
        />
        <Controller
          control={control}
          name="staffType"
          render={({ field }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="staffType-simple-select-outlined-label">
                {t('Is it Manual')}
              </InputLabel>
              <Select
                labelId="staffType-simple-select-outlined-label"
                id="staffType"
                label={t('Is it Manual')}
                readOnly
                {...field}
              >
                <MenuItem value={0}>{t('Bot')}</MenuItem>
                <MenuItem value={1}>{t('Manual')}</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {staffType === 1 && !!defaultValues.id && (
          <>
            <DraggableDialog title={t('Change Password')} ref={refOfDialog}>
              <ChangePasswordForm id={defaultValues.id} />
            </DraggableDialog>
            <Button
              variant="contained"
              color="default"
              onClick={() => {
                refOfDialog.current?.setOpen(true);
              }}
            >
              {t('Change Password')}
            </Button>
          </>
        )}
        {staffType === 1 && !defaultValues.id && (
          <>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              type="password"
              label={t('Password')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
              }}
              error={errors.password && true}
              helperText={errors.password?.message}
              {...register('password', {
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
          </>
        )}
        <Controller
          control={control}
          name="role"
          defaultValue="ROLE_STAFF"
          render={({ field }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="role-simple-select-outlined-label">
                {t('Role')}
              </InputLabel>

              <Authorized
                authority={['admin']}
                noMatch={
                  <Select
                    labelId="role-simple-select-outlined-label"
                    id="role"
                    label={t('Role')}
                    {...field}
                  >
                    <MenuItem value="ROLE_STAFF">{t('Staff')}</MenuItem>
                  </Select>
                }
              >
                <Select
                  labelId="role-simple-select-outlined-label"
                  id="role"
                  label={t('Role')}
                  {...field}
                >
                  <MenuItem value="ROLE_ADMIN">{t('Administrator')}</MenuItem>
                  {/* <MenuItem value="ROLE_LEADER">组长</MenuItem> */}
                  {/* <MenuItem value="ROLE_QA">质检</MenuItem> */}
                  <MenuItem value="ROLE_STAFF">{t('Staff')}</MenuItem>
                </Select>
              </Authorized>
            </FormControl>
          )}
        />
        {groupList && (
          <Controller
            control={control}
            name="groupId"
            rules={{ required: t('The group is required') }}
            render={({
              field: { onChange, value },
              fieldState: { error: groupIdError },
            }) => (
              <FormControl
                variant="outlined"
                margin="normal"
                fullWidth
                error={Boolean(groupIdError)}
              >
                <InputLabel id="demo-mutiple-chip-label">
                  {t('Belong to Group')}
                </InputLabel>
                <Select
                  labelId="groupId"
                  id="groupId"
                  onChange={onChange}
                  defaultValue=""
                  value={value}
                  label={t('Belong to Group')}
                >
                  {groupList.map((it) => {
                    return (
                      <MenuItem key={it.id} value={it.id}>
                        {it.groupName}
                      </MenuItem>
                    );
                  })}
                </Select>
                {groupIdError && (
                  <FormHelperText>{groupIdError?.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        )}
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="realName"
          label={t('Real name')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          {...register('realName')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="nickName"
          label={t('Nickname')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          {...register('nickName')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          type="number"
          id="simultaneousService"
          label={t('Number of simultaneous services')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          error={errors.simultaneousService && true}
          helperText={errors.simultaneousService?.message}
          {...register('simultaneousService', {
            min: {
              value: 0,
              message: t('The minimum Number of simultaneous services is 0'),
            },
            valueAsNumber: true,
          })}
        />
        {/* <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          type="number"
          id="maxTicketPerDay"
          label="工单 每日上限"
          defaultValue="0"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          error={errors.maxTicketPerDay && true}
          helperText={errors.maxTicketPerDay?.message}
          {...register('maxTicketPerDay', {
            min: {
              value: 0,
              message: '工单 最小为0',
            },
            max: {
              value: 999,
              message: '工单 最大为999',
            },
            valueAsNumber: true,
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          type="number"
          id="maxTicketAllTime"
          defaultValue="0"
          label="工单 总上限"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          error={errors.maxTicketAllTime && true}
          helperText={errors.maxTicketAllTime?.message}
          {...register('maxTicketAllTime', {
            min: {
              value: 0,
              message: '工单 最小为0',
            },
            max: {
              value: 999,
              message: '工单 最大为999',
            },
            valueAsNumber: true,
          })}
        /> */}
        <Controller
          control={control}
          defaultValue={0}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="gender-simple-select-outlined-label">
                {t('Gender')}
              </InputLabel>
              <Select
                labelId="gender-simple-select-outlined-label"
                id="gender"
                onChange={onChange}
                value={value}
                label={t('Gender')}
              >
                <MenuItem value={0}>{t('Male')}</MenuItem>
                <MenuItem value={1}>{t('Female')}</MenuItem>
                <MenuItem value={99}>{t('Other')}</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="mobilePhone"
          label={t('Mobile')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneAndroidIcon />
              </InputAdornment>
            ),
          }}
          {...register('mobilePhone', { maxLength: 150 })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="personalizedSignature"
          label={t('Signature')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          error={errors.personalizedSignature && true}
          helperText={errors.personalizedSignature?.message}
          {...register('personalizedSignature', { maxLength: 250 })}
        />
        <FormControlLabel
          control={
            <Controller
              control={control}
              defaultValue
              name="enabled"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              )}
            />
          }
          label={t('Enable?')}
        />
        <SubmitButton />
      </form>
    </div>
  );
}

StaffForm.defaultProps = {
  mutationCallback: undefined,
};
