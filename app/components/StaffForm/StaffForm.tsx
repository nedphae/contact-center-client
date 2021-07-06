import React, { useMemo, useState } from 'react';
import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';

import AccountCircle from '@material-ui/icons/AccountCircle';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import LockIcon from '@material-ui/icons/Lock';
import EmailIcon from '@material-ui/icons/Email';
import { InlineIcon } from '@iconify/react';
import vipLine from '@iconify-icons/ri/vip-line';
import noteLine from '@iconify-icons/clarity/note-line';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import {
  Avatar,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import Upload from 'rc-upload';

import config from 'app/config/clientConfig';
import Staff from 'app/domain/StaffInfo';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    formControl: {
      margin: theme.spacing(1),
      width: '100%', // Fix IE 11 issue.
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
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
  mutation Staff($staffInput: StaffInput!) {
    saveStaff(staff: $staffInput) {
      id
      organizationId
      username
      role
      staffGroupId
      realName
      nickName
      avatar
      simultaneousService
      maxTicketPerDay
      maxTicketAllTime
      staffType
      gender
      mobilePhone
      personalizedSignature
      enabled
    }
  }
`;

type StaffWithPassword = Object.Merge<
  Staff,
  { password?: string; password_repeat?: string }
>;

export default function StaffForm(props: FormProps) {
  const { defaultValues, mutationCallback } = props;
  const { staffType } = defaultValues;
  const classes = useStyles();
  const { handleSubmit, register, control, setValue, watch, errors } =
    useForm<StaffWithPassword>({
      defaultValues,
    });
  const [uploading, setUploading] = useState<boolean>();
  const [error, setError] = useState<string | null>(null);
  const [saveStaff, { loading, data }] = useMutation<Graphql>(MUTATION_STAFF);

  const password = watch('password');
  const avatar = watch('avatar');

  const imgUploadProps = useMemo(() => {
    return {
      action: `${config.web.host}/${config.oss.path}/staff/img`,
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

  const onSubmit: SubmitHandler<Staff> = (form) => {
    saveStaff({ variables: { staffInput: form } });
  };

  const handleClose = (_event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(null);
  };

  if (mutationCallback && data) {
    mutationCallback(data.saveStaff);
  }

  return (
    <div className={classes.paper}>
      {(uploading || loading) && <CircularProgress />}
      {data && <Typography>Success!</Typography>}
      <Snackbar
        open={error !== null}
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
          name="id"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <Upload {...imgUploadProps}>
          <Avatar
            alt="上传头像"
            src={`${config.web.host}/${config.oss.path}/staff/img/${avatar}`}
          >
            头像
          </Avatar>
        </Upload>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="avatar"
          name="avatar"
          type="hidden"
          value={avatar}
          inputRef={register()}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="username"
          name="username"
          label="用户名"
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          error={errors.username && true}
          helperText={errors.username}
          inputRef={register({
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
        {staffType && staffType === 1 && (
          <>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="password"
              name="password"
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
              helperText={errors.password}
              inputRef={register({
                required: '必须提供密码',
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
              name="password_repeat"
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
              helperText={errors.password_repeat}
              inputRef={register({
                validate: (value) => value === password || '密码不相符',
              })}
            />
            <FormControl variant="filled" className={classes.formControl}>
              <InputLabel id="demo-mutiple-chip-label">角色</InputLabel>
              <Controller
                control={control}
                name="role"
                render={({ onChange, value }) => (
                  <Select
                    labelId="role"
                    id="role"
                    onChange={onChange}
                    value={value}
                  >
                    <MenuItem value="ROLE_ADMIN">管理员</MenuItem>
                    <MenuItem value="ROLE_LEADER">组长</MenuItem>
                    <MenuItem value="ROLE_QA">质检</MenuItem>
                    <MenuItem value="ROLE_STAFF">客服</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </>
        )}
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="staffGroupId"
          name="staffGroupId"
          label="所属分组"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
          inputRef={register({ maxLength: 150 })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="realName"
          name="realName"
          label="实名"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={vipLine} />
              </InputAdornment>
            ),
          }}
          inputRef={register()}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="nickName"
          name="nickName"
          label="昵称"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          inputRef={register()}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          type="number"
          id="simultaneousService"
          name="simultaneousService"
          label="同时接待量"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          error={errors.simultaneousService && true}
          helperText={errors.simultaneousService}
          inputRef={register({
            min: {
              value: 0,
              message: '同时接待量 最小为0',
            },
            valueAsNumber: true,
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          type="number"
          id="maxTicketPerDay"
          name="maxTicketPerDay"
          label="工单 每日上限"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          error={errors.maxTicketPerDay && true}
          helperText={errors.maxTicketPerDay}
          inputRef={register({
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
          name="maxTicketAllTime"
          label="工单 总上限"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          error={errors.maxTicketAllTime && true}
          helperText={errors.maxTicketAllTime}
          inputRef={register({
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
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="demo-mutiple-chip-label">是否是机器人</InputLabel>
          <Controller
            control={control}
            name="staffType"
            render={({ onChange, value }) => (
              <Select
                labelId="staffType"
                id="staffType"
                onChange={onChange}
                value={value}
                inputProps={{ readOnly: true }}
              >
                <MenuItem value={0}>机器人</MenuItem>
                <MenuItem value={1}>人工</MenuItem>
              </Select>
            )}
          />
        </FormControl>
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="demo-mutiple-chip-label">性别</InputLabel>
          <Controller
            control={control}
            name="gender"
            render={({ onChange, value }) => (
              <Select
                labelId="gender"
                id="gender"
                onChange={onChange}
                value={value}
              >
                <MenuItem value={0}>男</MenuItem>
                <MenuItem value={1}>女</MenuItem>
                <MenuItem value={99}>其他</MenuItem>
              </Select>
            )}
          />
        </FormControl>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="mobilePhone"
          name="mobilePhone"
          label="手机"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneAndroidIcon />
              </InputAdornment>
            ),
          }}
          inputRef={register({ maxLength: 150 })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="personalizedSignature"
          name="personalizedSignature"
          label="个性签名"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          error={errors.username && true}
          helperText={errors.username}
          inputRef={register({ maxLength: 250 })}
        />
        <FormControlLabel
          control={
            <Controller
              control={control}
              defaultValue
              name="enabled"
              render={({ onChange, value }) => (
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
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
        >
          保存
        </Button>
      </form>
    </div>
  );
}

StaffForm.defaultProps = {
  mutationCallback: undefined,
};
