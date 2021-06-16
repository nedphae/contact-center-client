import React, { useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/client';
import { SubmitHandler, useForm } from 'react-hook-form';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
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
  UpdateCustomerGraphql,
  MUTATION_CUSTOMER,
} from 'app/domain/graphql/Customer';
import { updateCustomer } from 'app/state/session/sessionAction';
import { DetailData } from 'app/domain/Customer';

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
  id: number;
  organizationId: number;
  readonly uid: string;
  name: string;
  mobile: string | undefined;
  email: string | undefined;
  vipLevel: number | undefined;
  detailData: DetailData[] | undefined;
}

interface CustomerFormProps {
  defaultValues: FormValues;
}
export default function CustomerForm(props: CustomerFormProps) {
  const { defaultValues } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  // TODO: 显示更新错误
  const [editCustomer, { data }] =
    useMutation<UpdateCustomerGraphql>(MUTATION_CUSTOMER);
  const { register, handleSubmit } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    if (data) {
      dispatch(updateCustomer(data.updateCustomer));
    }
  }, [data, dispatch]);

  const onSubmit: SubmitHandler<FormValues> = async (form) => {
    // 用户信息表单
    editCustomer({ variables: { customerInput: form } });
  };
  return (
    <div className={classes.paper}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues.id || ''}
          name="id"
          type="hidden"
          inputRef={register({ maxLength: 50, valueAsNumber: true })}
        />
        <TextField
          value={defaultValues.organizationId || ''}
          name="organizationId"
          type="hidden"
          inputRef={register({ maxLength: 50, valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="uid"
          name="uid"
          label="用户标识"
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
          id="mobile"
          name="mobile"
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
          id="email"
          name="email"
          label="邮箱"
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={vipLine} />
              </InputAdornment>
            ),
          }}
          inputRef={register({ maxLength: 2, valueAsNumber: true })}
        />
        {defaultValues.detailData !== undefined &&
          defaultValues.detailData
            .filter(({ hidden }) => hidden === false)
            .sort((a, b) => {
              if (!a.index) a.index = Number.MAX_SAFE_INTEGER;
              if (!b.index) b.index = Number.MAX_SAFE_INTEGER;
              return a.index - b.index;
            })
            .map((detail, index) => (
              <React.Fragment key={detail.id}>
                <TextField
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
  );
}
