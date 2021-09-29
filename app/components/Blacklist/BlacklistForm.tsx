import React from 'react';

import _ from 'lodash';
import { useMutation } from '@apollo/client';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { BlacklistFormProp } from 'app/domain/Blacklist';
import {
  SaveBlacklistGraphql,
  MUTATION_SAVE_BLACKLIST,
} from 'app/domain/graphql/Blacklist';
import useAlert from 'app/hook/alert/useAlert';
import SubmitButton from '../Form/SubmitButton';

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

interface BlacklistFormProps {
  defaultValues: BlacklistFormProp;
}
export default function BlacklistForm(props: BlacklistFormProps) {
  const { defaultValues } = props;
  const classes = useStyles();

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveBlacklist, { loading }] = useMutation<SaveBlacklistGraphql>(
    MUTATION_SAVE_BLACKLIST,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const { register, handleSubmit, control, setValue } =
    useForm<BlacklistFormProp>({
      defaultValues,
    });

  const onSubmit: SubmitHandler<BlacklistFormProp> = (form) => {
    form.preventSource = form.preventStrategy === 'UID' ? form.uid : form.ip;
    const blacklist = _.omit(form, 'ip', 'uid');
    saveBlacklist({ variables: { blacklist: [blacklist] } });
  };
  return (
    <div className={classes.paper}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues.uid || ''}
          name="uid"
          type="hidden"
          inputRef={register({ required: true })}
        />
        <TextField
          value={defaultValues.ip || ''}
          name="ip"
          type="hidden"
          inputRef={register({ required: true })}
        />
        <TextField
          name="effectiveTime"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <TextField
          name="failureTime"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="preventStrategy"
          defaultValue="UID"
          render={({ onChange, value }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="role-simple-select-outlined-label">
                黑名单类型
              </InputLabel>
              <Select
                labelId="role-simple-select-outlined-label"
                id="role"
                label="黑名单类型"
                onChange={onChange}
                value={value}
              >
                <MenuItem value="UID">用户标识 UID</MenuItem>
                <MenuItem value="IP">IP地址</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <FormControl variant="outlined" margin="normal" fullWidth>
          <InputLabel id="role-simple-select-outlined-label">
            拉黑时间
          </InputLabel>
          <Select
            labelId="role-simple-select-outlined-label"
            id="role"
            label="黑名单类型"
            defaultValue={1}
            onChange={(event) => {
              if (event.target.value !== 0) {
                const now = new Date().getTime();
                setValue('effectiveTime', now);
                setValue(
                  'failureTime',
                  now + (event.target.value as number) * 3600000
                );
              } else {
                setValue('effectiveTime', undefined);
                setValue('failureTime', undefined);
              }
            }}
          >
            <MenuItem value={0}>永久屏蔽</MenuItem>
            <MenuItem value={0.5}>半小时</MenuItem>
            <MenuItem value={1}>1小时</MenuItem>
            <MenuItem value={2}>2小时</MenuItem>
            <MenuItem value={6}>6小时</MenuItem>
            <MenuItem value={12}>12小时</MenuItem>
            <MenuItem value={24}>一天</MenuItem>
            <MenuItem value={24 * 7}>一周</MenuItem>
          </Select>
        </FormControl>
        <SubmitButton />
      </form>
    </div>
  );
}
