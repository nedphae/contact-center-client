/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import BusinessIcon from '@material-ui/icons/Business';

import { useMutation, useQuery } from '@apollo/client';
import useAlert from 'renderer/hook/alert/useAlert';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import {
  QUERY_ORG,
  MUTATION_ORG,
  OrganizationGraphql,
  OrganizationInput,
  UpdateOrganizationGraphql,
} from 'renderer/domain/graphql/Organization';

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  }),
);

export default function OrgInfo() {
  const classes = useStyles();
  const { data: defaultOrganization } =
    useQuery<OrganizationGraphql>(QUERY_ORG);

  const { handleSubmit, register, reset } = useForm<OrganizationInput>({
    defaultValues: {},
    shouldUnregister: true,
  });

  useEffect(() => {
    if (defaultOrganization?.getOrganization) {
      reset(defaultOrganization?.getOrganization);
    }
  }, [defaultOrganization?.getOrganization, reset]);

  const { onLoadding, onCompleted, onError } = useAlert();
  const [updateOrganization, { loading }] =
    useMutation<UpdateOrganizationGraphql>(MUTATION_ORG, {
      onCompleted,
      onError,
    });
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<OrganizationInput> = async (form) => {
    await updateOrganization({
      variables: { organization: _.omit(form, '__typename') },
    });
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="企业名称"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon />
              </InputAdornment>
            ),
          }}
          {...register('name')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="注册手机号"
          value={defaultOrganization?.getOrganization.phone}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="企业邮箱"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
          {...register('email')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="企业地址"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon />
              </InputAdornment>
            ),
          }}
          {...register('address')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="企业主页"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon />
              </InputAdornment>
            ),
          }}
          {...register('homepage')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="企业详细信息"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon />
              </InputAdornment>
            ),
          }}
          {...register('detail')}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
