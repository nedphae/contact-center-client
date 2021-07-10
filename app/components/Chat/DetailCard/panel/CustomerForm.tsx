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
import noteLine from '@iconify-icons/clarity/note-line';
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
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  })
);

export interface CustomerFormValues {
  id: number | undefined;
  organizationId: number;
  readonly uid: string;
  name: string;
  mobile: string | undefined;
  email: string | undefined;
  vipLevel: number | undefined;
  remarks: string | undefined;
  detailData: DetailData[] | undefined;
}

interface CustomerFormProps {
  defaultValues: CustomerFormValues | undefined;
  shouldDispatch: boolean;
}
export default function CustomerForm(props: CustomerFormProps) {
  const { defaultValues, shouldDispatch } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  // TODO: 显示更新错误
  const [editCustomer, { data }] =
    useMutation<UpdateCustomerGraphql>(MUTATION_CUSTOMER);
  const { register, handleSubmit, errors } = useForm<CustomerFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (data && shouldDispatch) {
      dispatch(updateCustomer(data.updateCustomer));
    }
  }, [data, dispatch, shouldDispatch]);

  const onSubmit: SubmitHandler<CustomerFormValues> = async (form) => {
    // 用户信息表单
    editCustomer({ variables: { customerInput: form } });
  };
  return (
    <div className={classes.paper}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || ''}
          name="id"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <TextField
          value={defaultValues?.organizationId || ''}
          name="organizationId"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
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
          inputRef={register()}
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
          error={errors.name && true}
          helperText={errors.name}
          inputRef={register({
            maxLength: {
              value: 80,
              message: '用户姓名长度不能大于80个字符',
            },
          })}
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
          error={errors.mobile && true}
          helperText={errors.mobile}
          inputRef={register({
            maxLength: {
              value: 20,
              message: '手机号码长度不能大于20个字符',
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="email"
          name="email"
          label="邮箱"
          error={errors.email && true}
          helperText={errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
          inputRef={register({
            maxLength: {
              value: 150,
              message: '邮箱长度不能大于150个字符',
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="vipLevel"
          name="vipLevel"
          label="Vip 等级"
          type="number"
          error={errors.vipLevel && true}
          helperText={errors.vipLevel}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            inputProps: { min: 0, max: 99 },
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={vipLine} />
              </InputAdornment>
            ),
          }}
          inputRef={register({
            min: {
              value: 0,
              message: 'VIP 等级最小为0',
            },
            max: {
              value: 99,
              message: 'VIP 等级最大为99',
            },
            valueAsNumber: true,
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          id="remarks"
          name="remarks"
          label="备注"
          error={errors.remarks && true}
          helperText={errors.remarks}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          inputRef={register({
            maxLength: {
              value: 500,
              message: '备注长度不能大于500个字符',
            },
          })}
        />
        {defaultValues?.detailData !== undefined &&
          defaultValues?.detailData
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
                  inputRef={register()}
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
                  inputRef={register()}
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
