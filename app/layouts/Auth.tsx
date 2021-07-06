/**
 * 权限页面
 * 配置登录，验证权限
 */
import React from 'react';
import { useDispatch } from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import NumberFormat from 'react-number-format';
import { useForm, SubmitHandler } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { oauthLogin, LoginParamsType } from 'app/service/loginService';
import { setUserAsync } from 'app/state/staff/staffAction';
import { history } from 'app/store';
import useAutoLogin from 'app/hook/autoLogin/useAutoLogin';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
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
  readonly remember: boolean;
};

export default function Auth() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { register, handleSubmit } = useForm<FormValues>();
  useAutoLogin(true);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // 清楚密码中的空格
    data.org_id = Number((data.org_id as string).replaceAll(' ', ''));
    if (typeof data.org_id === 'number') {
      const token = await oauthLogin(data as LoginParamsType, data.remember);
      dispatch(setUserAsync(token));
      history.push('/');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
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
            inputRef={register({ required: true, maxLength: 9 })}
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
            inputRef={register({ required: true, maxLength: 15 })}
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
            autoComplete="current-password"
            inputRef={register({ required: true, maxLength: 15 })}
          />
          <FormControlLabel
            name="remember"
            control={
              <Checkbox
                color="primary"
                inputRef={register({ required: false })}
              />
            }
            label="Remember me"
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
          <Grid container>
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
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
