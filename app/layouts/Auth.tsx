/* eslint-disable react/jsx-props-no-spreading */
/**
 * 权限页面
 * 配置登录，验证权限
 */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import NumberFormat from 'react-number-format';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  SnackbarCloseReason,
} from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { oauthLogin, LoginParamsType } from 'app/service/loginService';
import { setUserAsync } from 'app/state/staff/staffAction';
import { history } from 'app/store';
import useAutoLogin from 'app/hook/autoLogin/useAutoLogin';
import { OnlineStatus } from 'app/domain/constant/Staff';
import { saveOnlineStatus } from 'app/electron/jwtStorage';
import { Alert } from '@material-ui/lab';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link target="_blank" color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

function NumberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      format="#### ####"
      isNumericString
      // prefix="$"
    />
  );
}

type FormValues = {
  org_id: string | number;
  readonly username: string;
  readonly password: string;
  readonly onlineStatus: OnlineStatus;
  readonly remember: boolean;
};

export default function Auth() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { register, handleSubmit, control, errors } = useForm<FormValues>();
  const [error, setError] = useState<string>();
  useAutoLogin(true);

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    // 清楚密码中的空格
    data.org_id = Number((data.org_id as string).replaceAll(' ', ''));
    if (typeof data.org_id === 'number') {
      try {
        const token = await oauthLogin(data as LoginParamsType, data.remember);
        dispatch(setUserAsync(token, data.onlineStatus));
        // 保存在线状态
        saveOnlineStatus(data.onlineStatus);
        history.push('/');
      } catch (ex) {
        setError('登录失败，请检查用户名或密码');
      }
    }
  };

  const handleClose = (
    _event: React.SyntheticEvent<Element, Event>,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(undefined);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      {error && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}

      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          系统登陆
        </Typography>
        <form
          className={classes.form}
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="org"
            label="机构ID"
            name="org_id"
            autoFocus
            InputProps={{
              inputComponent: NumberFormatCustom as any,
            }}
            autoComplete="organization"
            error={errors.org_id && true}
            helperText={errors.org_id?.message}
            inputRef={register({
              required: { value: true, message: '机构ID必填' },
              maxLength: 50,
            })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="用户名"
            name="username"
            autoComplete="username"
            error={errors.username && true}
            helperText={errors.username?.message}
            inputRef={register({
              required: { value: true, message: '用户名必填' },
              maxLength: 100,
            })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="密码"
            type="password"
            id="password"
            error={errors.password && true}
            helperText={errors.password?.message}
            autoComplete="current-password"
            inputRef={register({
              required: { value: true, message: '密码必填' },
              maxLength: 100,
            })}
          />
          <Controller
            control={control}
            name="onlineStatus"
            defaultValue={1}
            render={({ onChange, value }) => (
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel id="demo-mutiple-chip-label">在线状态</InputLabel>
                <Select
                  labelId="onlineStatus"
                  id="onlineStatus"
                  onChange={onChange}
                  value={value}
                  label="在线状态"
                >
                  <MenuItem value={1}>在线</MenuItem>
                  <MenuItem value={0}>离线</MenuItem>
                  <MenuItem value={2}>忙碌</MenuItem>
                  <MenuItem value={3}>离开</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <FormControlLabel
            name="remember"
            control={
              <Checkbox
                color="primary"
                inputRef={register({ required: false })}
              />
            }
            label="记住我"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            登录
          </Button>
          {/* <Grid container>
            <Grid item xs>
              <Link href="/#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/#" variant="body2">
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid> */}
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
