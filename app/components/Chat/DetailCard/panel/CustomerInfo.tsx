import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation, useLazyQuery } from '@apollo/client';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import EmailIcon from '@material-ui/icons/Email';
import { InlineIcon } from '@iconify/react';
import vipLine from '@iconify-icons/ri/vip-line';
import NoteAddIcon from '@material-ui/icons/NoteAdd';

import {
  getSelectedConstomer,
  updateCustomer,
} from 'app/state/session/sessionAction';
import { MUTATION_CUSTOMER, QUERY_CUSTOMER } from 'app/domain/graphql/Customer';
import { Customer } from 'app/domain/Customer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
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

interface FormValues {
  readonly id: number;
  readonly organizationId: number;
  readonly uid: string;
  name: string;
  phone: string;
  email: boolean;
  vipLevel: number;
}

export default function CustomerInfo() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm<FormValues>();
  const user = useSelector(getSelectedConstomer);
  // TODO: 显示更新错误
  const [editCustomer, { error }] = useMutation<Customer>(MUTATION_CUSTOMER);
  const [getCustomer, { data }] = useLazyQuery<Customer>(QUERY_CUSTOMER);

  useEffect(() => {
    if (data !== undefined) {
      dispatch(updateCustomer(data));
    }
  }, [data, dispatch]);

  const onSubmit: SubmitHandler<FormValues> = async (form) => {
    // 用户信息表单
    editCustomer({ variables: { customerInput: form } });
    getCustomer({ variables: { orgId: form.organizationId, userId: form.id } });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField
            value={user.userId || ''}
            name="id"
            type="hidden"
            inputRef={register({ maxLength: 50 })}
          />
          <TextField
            value={user.organizationId || ''}
            name="organizationId"
            type="hidden"
            inputRef={register({ maxLength: 50 })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="uid"
            name="uid"
            label="用户标识"
            value={user.uid || ''}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            inputRef={register({ maxLength: 50 })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="name"
            name="name"
            label="用户姓名"
            value={user.name || ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            inputRef={register({ maxLength: 50 })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="phone"
            name="phone"
            label="手机"
            value={user.mobile || ''}
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
            id="email"
            name="email"
            label="邮箱"
            value={user.email || ''}
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
            id="vipLevel"
            name="vipLevel"
            label="Vip 等级"
            value={user.vipLevel || ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InlineIcon icon={vipLine} />
                </InputAdornment>
              ),
            }}
            inputRef={register({ maxLength: 150 })}
          />
          {user.detailData !== undefined &&
            user.detailData
              .filter(({ hidden }) => hidden === false)
              .sort((a, b) => {
                if (!a.index) a.index = Number.MAX_SAFE_INTEGER;
                if (!b.index) b.index = Number.MAX_SAFE_INTEGER;
                return a.index - b.index;
              })
              .map((detail, index) => (
                <React.Fragment key={detail.id}>
                  <TextField
                    value={detail.key}
                    type="hidden"
                    id={`key.${detail.id}`}
                    name={`detailData.${index}.key`}
                    inputRef={register({ maxLength: 150 })}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id={`value.${detail.id}`}
                    name={`detailData.${index}.value`}
                    label={detail.label}
                    value={detail.value || ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NoteAddIcon />
                        </InputAdornment>
                      ),
                    }}
                    inputRef={register({ maxLength: 150 })}
                  />
                </React.Fragment>
              ))}
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
    </Container>
  );
}
