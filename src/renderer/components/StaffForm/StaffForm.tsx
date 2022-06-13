/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

import Authorized from 'renderer/components/Authorized/Authorized';
import {
  getDownloadS3StaffImgPath,
  getUploadS3StaffImgPath,
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
  const [saveStaff, { loading, data }] = useMutation<Graphql>(MUTATION_STAFF, {
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
      action: getUploadS3StaffImgPath(),
      multiple: false,
      accept: 'image/png,image/gif,image/jpeg',
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

  const onSubmit: SubmitHandler<StaffWithPassword> = (form) => {
    saveStaff({
      variables: {
        staff: _.omit(form, 'password_repeat', 'groupName', '__typename'),
      },
    });
  };

  const handleClose = (_event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(undefined);
  };

  useEffect(() => {
    if (mutationCallback && data?.saveStaff) {
      mutationCallback(data.saveStaff);
    }
  }, [data, mutationCallback]);

  return (
    <div className={classes.paper}>
      {uploading && <CircularProgress />}
      <Snackbar
        open={error !== undefined}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          上传失败:{error}
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
            头像
          </Avatar>
        </Upload>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="username"
          label="用户名"
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
            required: '必须提供用户名',
            maxLength: {
              value: 50,
              message: '用户名不能大于50位',
            },
            minLength: {
              value: 4,
              message: '用户名至少4位',
            },
          })}
        />
        <Controller
          control={control}
          name="staffType"
          render={({ field }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="staffType-simple-select-outlined-label">
                是否是人工
              </InputLabel>
              <Select
                labelId="staffType-simple-select-outlined-label"
                id="staffType"
                label="是否是机器人"
                readOnly
                {...field}
              >
                <MenuItem value={0}>机器人</MenuItem>
                <MenuItem value={1}>人工</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {staffType === 1 && !!defaultValues.id && (
          <>
            <DraggableDialog title="修改密码" ref={refOfDialog}>
              <ChangePasswordForm id={defaultValues.id} />
            </DraggableDialog>
            <Button
              variant="contained"
              color="default"
              onClick={() => {
                refOfDialog.current?.setOpen(true);
              }}
            >
              修改密码
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
              label="密码"
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
          </>
        )}
        <Controller
          control={control}
          name="role"
          defaultValue="ROLE_STAFF"
          render={({ field }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="role-simple-select-outlined-label">
                角色
              </InputLabel>

              <Authorized
                authority={['admin']}
                noMatch={
                  <Select
                    labelId="role-simple-select-outlined-label"
                    id="role"
                    label="角色"
                    {...field}
                  >
                    <MenuItem value="ROLE_STAFF">客服</MenuItem>
                  </Select>
                }
              >
                <Select
                  labelId="role-simple-select-outlined-label"
                  id="role"
                  label="角色"
                  {...field}
                >
                  <MenuItem value="ROLE_ADMIN">管理员</MenuItem>
                  {/* <MenuItem value="ROLE_LEADER">组长</MenuItem> */}
                  {/* <MenuItem value="ROLE_QA">质检</MenuItem> */}
                  <MenuItem value="ROLE_STAFF">客服</MenuItem>
                </Select>
              </Authorized>
            </FormControl>
          )}
        />
        {groupList && (
          <Controller
            control={control}
            name="groupId"
            rules={{ required: '所属分组必选' }}
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
                <InputLabel id="demo-mutiple-chip-label">所属分组</InputLabel>
                <Select
                  labelId="groupId"
                  id="groupId"
                  onChange={onChange}
                  defaultValue=""
                  value={value}
                  label="所属分组"
                >
                  {groupList.map((it) => {
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
        )}
        {!defaultValues.id && (
          <Alert severity="warning">
            监控统计 和 考勤统计 以客服实名为准，如果有同名的客服，请标记
            <br />
            如: 李白02
          </Alert>
        )}
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="realName"
          label="实名"
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
          label="昵称"
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
          label="同时接待量"
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
              message: '同时接待量 最小为0',
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
          defaultValue="0"
          name="gender"
          render={({ field: { onChange, value } }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="gender-simple-select-outlined-label">
                性别
              </InputLabel>
              <Select
                labelId="gender-simple-select-outlined-label"
                id="gender"
                onChange={onChange}
                value={value}
                label="性别"
              >
                <MenuItem value={0}>男</MenuItem>
                <MenuItem value={1}>女</MenuItem>
                <MenuItem value={99}>其他</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="mobilePhone"
          label="手机"
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
          label="个性签名"
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
          label="是否启用"
        />
        <SubmitButton />
      </form>
    </div>
  );
}

StaffForm.defaultProps = {
  mutationCallback: undefined,
};
