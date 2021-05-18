import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import EmailIcon from '@material-ui/icons/Email';
import { InlineIcon } from '@iconify/react';
import vipLine from '@iconify-icons/ri/vip-line';

import { getSelectedConstomer } from 'app/state/session/sessionAction';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
  })
);

type FormValues = {
  readonly uid: string;
  name: string;
  phone: string;
  email: boolean;
  vipLevel: number;
};

export default function CustomerInfo() {
  const classes = useStyles();
  const { register, handleSubmit } = useForm<FormValues>();
  const user = useSelector(getSelectedConstomer);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // 用户信息表单
    
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField
            defaultValue={user.userId}
            name="userId"
            type="hidden"
            inputRef={register()}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="uid"
            name="uid"
            label="用户标识"
            defaultValue={user.uid}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            inputRef={register()}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="name"
            name="name"
            label="用户姓名"
            defaultValue={user.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            inputRef={register()}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="phone"
            name="phone"
            label="手机"
            defaultValue={user.mobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneAndroidIcon />
                </InputAdornment>
              ),
            }}
            inputRef={register()}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="email"
            name="email"
            label="邮箱"
            defaultValue={user.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
            inputRef={register()}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="vipLevel"
            name="vipLevel"
            label="Vip 等级"
            defaultValue={user.vipLevel}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InlineIcon icon={vipLine} />
                </InputAdornment>
              ),
            }}
            inputRef={register()}
          />
          {user.detailData !== undefined &&
            user.detailData
              .filter(({ hidden }) => hidden === false)
              .sort((a, b) => {
                if (!a.index) a.index = Number.MAX_SAFE_INTEGER;
                if (!b.index) b.index = Number.MAX_SAFE_INTEGER;
                return a.index - b.index;
              })
              .map((data) => (
                <React.Fragment key={data.id}>
                  <TextField
                    defaultValue={data.id}
                    type="hidden"
                    id={`${data.key}.id`}
                    name={`detailData.${user.detailData?.indexOf(data)}.id`}
                    inputRef={register()}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id={`${data.key}.value`}
                    name={`detailData.${user.detailData?.indexOf(data)}.value`}
                    label={data.label}
                    defaultValue={data.value}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WcIcon />
                        </InputAdornment>
                      ),
                    }}
                    inputRef={register()}
                  />
                </React.Fragment>
              ))}
        </form>
      </div>
    </Container>
  );
}
