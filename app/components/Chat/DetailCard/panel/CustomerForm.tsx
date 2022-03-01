/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect } from 'react';

import _ from 'lodash';
import { Object } from 'ts-toolbelt';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/client';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import {
  createStyles,
  Theme,
  makeStyles,
  useTheme,
} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import EmailIcon from '@material-ui/icons/Email';
import { InlineIcon } from '@iconify/react';
import vipLine from '@iconify-icons/ri/vip-line';
import noteLine from '@iconify-icons/clarity/note-line';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import DoneIcon from '@material-ui/icons/Done';

import {
  UpdateCustomerGraphql,
  MUTATION_CUSTOMER,
  CustomerTagGraphql,
  QUERY_CUSTOMER_TAG,
} from 'app/domain/graphql/Customer';
import { updateCustomer } from 'app/state/session/sessionAction';
import { Customer, CustomerTagView } from 'app/domain/Customer';
import {
  Chip,
  FormControl,
  Input,
  InputLabel,
  Link,
  ListItemIcon,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import SubmitButton from 'app/components/Form/SubmitButton';
import useAlert from 'app/hook/alert/useAlert';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  })
);

export type CustomerFormValues = Object.Readonly<Customer, 'uid'>;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(selected: boolean, theme: Theme, color: string) {
  return {
    fontWeight: !selected
      ? theme.typography.fontWeightLight
      : theme.typography.fontWeightBold,
    backgroundColor: color,
  };
}

interface CustomerFormProps {
  defaultValues: CustomerFormValues | undefined;
  shouldDispatch: boolean;
}
export default function CustomerForm(props: CustomerFormProps) {
  const { defaultValues, shouldDispatch } = props;
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { data: allTags } = useQuery<CustomerTagGraphql>(QUERY_CUSTOMER_TAG);

  // 显示更新错误
  const { onLoadding, onCompleted, onError } = useAlert();
  const [editCustomer, { loading, data }] = useMutation<UpdateCustomerGraphql>(
    MUTATION_CUSTOMER,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
  } = useForm<CustomerFormValues>({
    defaultValues,
    shouldUnregister: true,
  });

  useEffect(() => {
    if (data && shouldDispatch) {
      dispatch(updateCustomer(data.updateCustomer));
    }
  }, [data, dispatch, shouldDispatch]);

  const onSubmit: SubmitHandler<CustomerFormValues> = async (form) => {
    // 用户信息表单
    editCustomer({
      variables: {
        customerInput: _.omit(form, '__typename', 'status', 'userId'),
      },
    });
  };

  const handleDelete = (name: string) => {
    const tags = getValues('tags') as CustomerTagView[];
    setValue(
      'tags',
      _.remove(tags, (v) => v.name !== name)
    );
  };
  return (
    <div className={classes.paper}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || ''}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />
        <TextField
          value={defaultValues?.organizationId || ''}
          type="hidden"
          {...register('organizationId', { valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="uid"
          label="用户标识"
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          {...register('uid')}
        />
        <Controller
          control={control}
          name="tags"
          defaultValue={defaultValues?.tags ?? []}
          // rules={{
          //   setValueAs: (val) =>
          //     val.map((v: string) => parseInt(v, 10)),
          // }}
          render={({ field: { onChange, value } }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="demo-mutiple-chip-label">客户标签</InputLabel>
              <Select
                labelId="demo-mutiple-chip-label"
                id="demo-mutiple-chip"
                multiple
                input={<Input id="select-multiple-chip" />}
                onChange={(event) => {
                  const currentValue = event.target.value as string[];
                  onChange(currentValue.map((it) => JSON.parse(it)));
                }}
                value={((value as CustomerTagView[]) ?? []).map((it) =>
                  JSON.stringify(it)
                )}
                label="客户标签"
                renderValue={(selected) => (
                  <div className={classes.chips}>
                    {(selected as string[])
                      .map((it) => JSON.parse(it) as CustomerTagView)
                      .map(({ name, color }) => (
                        <Chip
                          key={name}
                          label={name}
                          className={classes.chip}
                          onDelete={() => {
                            handleDelete(name);
                          }}
                          style={{ backgroundColor: color }}
                          color="secondary"
                          onMouseDown={(event) => {
                            event.stopPropagation();
                          }}
                        />
                      ))}
                  </div>
                )}
                MenuProps={MenuProps}
              >
                {allTags &&
                  allTags.getAllCustomerTag &&
                  allTags.getAllCustomerTag.map((tag) => {
                    const selected =
                      ((value as CustomerTagView[]) ?? [])
                        .map((it) => it.name)
                        .indexOf(tag.name) !== -1;
                    return (
                      <MenuItem
                        key={tag.id}
                        value={JSON.stringify(_.pick(tag, 'name', 'color'))}
                        style={getStyles(selected, theme, tag.color)}
                      >
                        {selected && (
                          <ListItemIcon>
                            <DoneIcon fontSize="small" />
                          </ListItemIcon>
                        )}
                        <Typography variant="inherit">{tag.name}</Typography>
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          )}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          label="用户姓名"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          error={errors.name && true}
          helperText={errors.name?.message}
          {...register('name', {
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
          label="手机"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneAndroidIcon />
              </InputAdornment>
            ),
          }}
          error={errors.mobile && true}
          helperText={errors.mobile?.message}
          {...register('mobile', {
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
          label="邮箱"
          error={errors.email && true}
          helperText={errors.email?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
          {...register('email', {
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
          multiline
          id="address"
          label="地址"
          error={errors.address && true}
          helperText={errors.address?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
          {...register('address')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="vipLevel"
          label="Vip 等级"
          type="number"
          error={errors.vipLevel && true}
          helperText={errors.vipLevel?.message}
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
          {...register('vipLevel', {
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
          label="备注"
          error={errors.remarks && true}
          helperText={errors.remarks?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InlineIcon icon={noteLine} />
              </InputAdornment>
            ),
          }}
          {...register('remarks', {
            maxLength: {
              value: 500,
              message: '备注长度不能大于500个字符',
            },
          })}
        />
        {defaultValues?.data &&
          defaultValues?.data
            .filter(({ hidden }) => hidden === false)
            .sort((a, b) => {
              if (!a.index) a.index = Number.MAX_SAFE_INTEGER;
              if (!b.index) b.index = Number.MAX_SAFE_INTEGER;
              return a.index - b.index;
            })
            .map((detail, index) => (
              <React.Fragment key={detail.key}>
                <TextField
                  type="hidden"
                  id={`${detail.key}.key`}
                  {...register(`data.${index}.key`)}
                />
                <TextField
                  type="hidden"
                  id={`${detail.key}.label`}
                  {...register(`data.${index}.label`)}
                />
                <TextField
                  type="hidden"
                  id={`${detail.key}.index`}
                  {...register(`data.${index}.index`)}
                />
                <TextField
                  type="hidden"
                  id={`${detail.key}.hidden`}
                  {...register(`data.${index}.hidden`)}
                />
                <TextField
                  type="hidden"
                  id={`${detail.key}.href`}
                  {...register(`data.${index}.href`)}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id={`${detail.key}.value`}
                  label={detail.label}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NoteAddIcon />
                      </InputAdornment>
                    ),
                  }}
                  {...register(`data.${index}.value`)}
                />
                {detail.href && (
                  <Link
                    target="_blank"
                    href={detail.href}
                    variant="body2"
                    style={{ marginLeft: 10 }}
                  >
                    点击查看详细信息
                  </Link>
                )}
              </React.Fragment>
            ))}
        <SubmitButton />
      </form>
    </div>
  );
}
