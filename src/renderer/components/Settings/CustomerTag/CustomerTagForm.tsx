/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import { ColorResult, SketchPicker } from 'react-color';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import GroupIcon from '@material-ui/icons/Group';

import { useMutation } from '@apollo/client';
import useAlert from 'renderer/hook/alert/useAlert';
import { CustomerTag } from 'renderer/domain/Customer';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import {
  CustomerTagSaveGraphql,
  MUTATION_SAVE_CUSTOMER_TAG,
} from 'renderer/domain/graphql/Customer';
import { Grid } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  })
);

interface FormProps {
  defaultValues: CustomerTag | undefined;
  refetch: () => void;
}

export default function CustomerTagForm(props: FormProps) {
  const { defaultValues, refetch } = props;
  const classes = useStyles();
  const { handleSubmit, register, control } = useForm<CustomerTag>({
    defaultValues,
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveCustomerTag, { loading, data }] =
    useMutation<CustomerTagSaveGraphql>(MUTATION_SAVE_CUSTOMER_TAG, {
      onCompleted,
      onError,
    });

  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<CustomerTag> = async (form) => {
    await saveCustomerTag({ variables: { customerTags: form } });
    refetch();
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveCustomerTag[0]?.id || ''}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          label="标签名称"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          {...register('name', {
            required: '必须设置标签名称',
            maxLength: {
              value: 50,
              message: '标签名称不能大于50位',
            },
          })}
        />
        <Controller
          control={control}
          name="color"
          defaultValue="#009688"
          render={({ field: { onChange: onchangeValue, value } }) => (
            <Grid container justifyContent="center">
              <SketchPicker
                color={value}
                onChange={(color: ColorResult) => {
                  onchangeValue(color.hex);
                }}
              />
            </Grid>
          )}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
