/* eslint-disable react/jsx-props-no-spreading */
/**
 * 权限页面
 * 配置登录，验证权限
 */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useTranslation, Trans } from 'react-i18next';

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
  CircularProgress,
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Alert } from '@material-ui/lab';

import { oauthLogin, LoginParamsType } from 'renderer/service/loginService';
import { setUserAsync } from 'renderer/state/staff/staffAction';
import useAutoLogin from 'renderer/hook/autoLogin/useAutoLogin';
import { OnlineStatusKey } from 'renderer/domain/constant/Staff';
import { saveOnlineStatus } from 'renderer/electron/jwtStorage';
import logo from 'renderer/assets/img/logo.ico';
import { green } from '@material-ui/core/colors';
import LanguageSwitcher from 'renderer/components/LanguageSwitcher/LanguageSwitcher';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link target="_blank" color="inherit" href="https://xbcs.top/">
        小白客服
      </Link>{' '}
      {new Date().getFullYear()}
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
    // backgroundColor: theme.palette.secondary.main,
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -8,
    marginLeft: -12,
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
  const { inputRef, onChange, name, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name,
            value: values.value,
          },
        });
      }}
      format="####"
      isNumericString
      // prefix="$"
    />
  );
}

type FormValues = {
  org_id: string | number;
  readonly username: string;
  readonly password: string;
  readonly onlineStatus: OnlineStatusKey;
  readonly remember: boolean;
};

export default function Auth() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { savedToken } = useAutoLogin(true);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>();
  const [signing, setSigning] = useState<boolean>(false);

  useEffect(() => {
    if (savedToken && !signing) {
      reset({
        org_id: savedToken.oid,
        username: savedToken.sub,
        password: '**********',
        remember: true,
      });
      setSigning(true);
    }
  }, [reset, savedToken, signing]);

  const [error, setError] = useState<string>();

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    // 清楚密码中的空格
    data.org_id = Number((data.org_id as string).replaceAll(' ', ''));
    if (typeof data.org_id === 'number') {
      setSigning(true);
      try {
        const token = await oauthLogin(data as LoginParamsType, data.remember);
        dispatch(setUserAsync(token, data.onlineStatus));
        // 保存在线状态
        saveOnlineStatus(data.onlineStatus);
        navigate('/');
      } catch (ex) {
        setSigning(false);
        setError(t('Login failed, please check your username or password'));
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
        <Avatar className={classes.avatar} src={logo} variant="square" />
        <Typography component="h1" variant="h5">
          小白客服系统
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
            label={t('Organization Id')}
            autoFocus
            InputProps={{
              inputComponent: NumberFormatCustom as any,
            }}
            autoComplete="organization"
            error={errors.org_id && true}
            helperText={errors.org_id?.message}
            {...register('org_id', {
              required: {
                value: true,
                message: t('Plaese enter a organization Id'),
              },
              maxLength: 50,
            })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label={t('Username')}
            autoComplete="username"
            error={errors.username && true}
            helperText={errors.username?.message}
            {...register('username', {
              required: {
                value: true,
                message: t('Plaese enter your username'),
              },
              maxLength: 100,
            })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label={t('Password')}
            type="password"
            id="password"
            error={errors.password && true}
            helperText={errors.password?.message}
            autoComplete="current-password"
            {...register('password', {
              required: {
                value: true,
                message: t('Plaese enter your password'),
              },
              maxLength: 100,
            })}
          />
          <Controller
            control={control}
            name="onlineStatus"
            defaultValue="ONLINE"
            render={({ field: { onChange, value } }) => (
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel id="demo-mutiple-chip-label">
                  {t('Online Status')}
                </InputLabel>
                <Select
                  labelId="onlineStatus"
                  id="onlineStatus"
                  onChange={onChange}
                  value={value}
                  label={t('Online Status')}
                >
                  <MenuItem value="ONLINE">{t('onlineStatus.Online')}</MenuItem>
                  <MenuItem value="OFFLINE">
                    {t('onlineStatus.Offline')}
                  </MenuItem>
                  <MenuItem value="BUSY">{t('onlineStatus.Bussy')}</MenuItem>
                  <MenuItem value="AWAY">{t('onlineStatus.Leave')}</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="remember"
            defaultValue={false}
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                )}
                label={t('Remember Me')}
              />
            )}
          />
          <div className={classes.wrapper}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={signing}
              className={classes.submit}
            >
              {t('Login')}
            </Button>
            {signing && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
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
      <LanguageSwitcher />
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
