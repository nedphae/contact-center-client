/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
} from 'renderer/domain/graphql/Customer';
import { updateCustomer } from 'renderer/state/session/sessionAction';
import { Customer, CustomerTagView } from 'renderer/domain/Customer';
import {
  Chip,
  FormControl,
  Input,
  InputLabel,
  Link,
  ListItemIcon,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@material-ui/core';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import useAlert from 'renderer/hook/alert/useAlert';
import javaInstant2DateStr from 'renderer/utils/timeUtils';

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
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
      width: '1vw',
      userSelect: 'auto',
    },
  }),
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
  const { defaultValues: tempDefaultValues, shouldDispatch } = props;
  const classes = useStyles();
  const { t } = useTranslation();
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
    },
  );
  if (loading) {
    onLoadding(loading);
  }

  const defaultValues = _.cloneDeep(tempDefaultValues);
  if (defaultValues) {
    defaultValues.tags = _.map(defaultValues?.tags ?? [], (tag) =>
      _.omit(tag, '__typename'),
    );
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    setValue,
    reset,
  } = useForm<CustomerFormValues>({
    defaultValues,
    shouldUnregister: true,
  });

  useEffect(() => {
    if (!_.isEqual(getValues().uid, defaultValues?.uid)) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, getValues]);

  useEffect(() => {
    if (data && shouldDispatch) {
      dispatch(updateCustomer(data.updateCustomer));
    }
  }, [data, dispatch, shouldDispatch]);

  const onSubmit: SubmitHandler<CustomerFormValues> = async (form) => {
    if (form.tags) {
      form.tags = _.map(form.tags, (tag) => _.omit(tag, '__typename'));
    }
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
      _.remove(tags, (v) => v.name !== name),
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
          value={defaultValues?.createdDate || ''}
          type="hidden"
          {...register('createdDate', { valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="uid"
          label={t('UID')}
          InputProps={{
            readOnly: defaultValues?.uid !== undefined,
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
              <InputLabel id="demo-mutiple-chip-label">
                {t('Customer Tag')}
              </InputLabel>
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
                  JSON.stringify(it, ['name', 'color'].sort()),
                )}
                label={t('Customer Tag')}
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
                        value={JSON.stringify(
                          _.pick(tag, 'name', 'color'),
                          ['name', 'color'].sort(),
                        )}
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
          label={t('Name')}
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
              message: t('Name Max Length'),
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="mobile"
          label={t('Mobile')}
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
              message: t('Mobile Max Length'),
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="email"
          label={t('Email')}
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
              message: t('Email Max Length'),
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          id="address"
          label={t('Address')}
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
          label={t('Vip')}
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
              message: t('Vip Min'),
            },
            max: {
              value: 99,
              message: t('Vip Max'),
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
          label={t('Remarks')}
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
              message: t('Remarks Max Length'),
            },
          })}
        />
        {defaultValues?.status?.referrer && (
          <>
            <Typography variant="body1" gutterBottom>
              {t('From Page')}:&nbsp;&nbsp;
            </Typography>
            <Tooltip title={defaultValues.status.referrer} aria-label="add">
              <div className={classes.wrapper}>
                <Link
                  variant="inherit"
                  color="primary"
                  href={defaultValues.status.referrer}
                  target="_blank"
                >
                  {defaultValues.status.referrer}
                </Link>
              </div>
            </Tooltip>
          </>
        )}
        {defaultValues?.status?.title && (
          <Typography variant="body1" gutterBottom>
            {t('From Page Title')}:&nbsp;&nbsp;
            {defaultValues?.status.title}
          </Typography>
        )}
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
                    {t('Click to view details')}
                  </Link>
                )}
              </React.Fragment>
            ))}
        {defaultValues?.createdDate && (
          <Typography variant="body1" gutterBottom>
            {t('Created Date')}:&nbsp;&nbsp;
            {javaInstant2DateStr(defaultValues?.createdDate as number)}
          </Typography>
        )}
        <SubmitButton />
      </form>
    </div>
  );
}
