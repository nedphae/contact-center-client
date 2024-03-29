/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { useMutation } from '@apollo/client';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { BlacklistFormProp } from 'renderer/domain/Blacklist';
import {
  SaveBlacklistGraphql,
  MUTATION_SAVE_BLACKLIST,
} from 'renderer/domain/graphql/Blacklist';
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
  const { t } = useTranslation();

  const [saveBlacklist] = useMutation<SaveBlacklistGraphql>(
    MUTATION_SAVE_BLACKLIST
  );
  const { register, handleSubmit, control, setValue } =
    useForm<BlacklistFormProp>({
      defaultValues,
      shouldUnregister: true,
    });

  const onSubmit: SubmitHandler<BlacklistFormProp> = (form) => {
    form.preventSource = form.preventStrategy === 'UID' ? form.uid : form.ip;
    const blacklist = _.omit(form, 'ip', 'uid', '__typename');
    toast.promise(saveBlacklist({ variables: { blacklist: [blacklist] } }), {
      pending: t('Saving'),
      success: t('Success'),
      error: t('Fail'),
    });
  };
  return (
    <div className={classes.paper}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <TextField
          defaultValue={defaultValues.uid || ''}
          type="hidden"
          {...register('uid', { required: true })}
        />
        <TextField
          defaultValue={defaultValues.ip || ''}
          type="hidden"
          {...register('ip', { required: true })}
        />
        <TextField
          type="hidden"
          {...register('effectiveTime', { valueAsNumber: true })}
        />
        <TextField
          type="hidden"
          {...register('failureTime', { valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="preventStrategy"
          defaultValue="UID"
          render={({ field: { onChange, value } }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="role-simple-select-outlined-label">
                {t('Block list type')}
              </InputLabel>
              <Select
                labelId="role-simple-select-outlined-label"
                id="role"
                label={t('Block list type')}
                onChange={onChange}
                value={value}
              >
                <MenuItem value="UID">{t('UID')}</MenuItem>
                <MenuItem value="IP">{t('IP Address')}</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        <FormControl variant="outlined" margin="normal" fullWidth>
          <InputLabel id="role-simple-select-outlined-label">
            {t('Block duration')}
          </InputLabel>
          <Select
            labelId="role-simple-select-outlined-label"
            id="role"
            label={t('Block duration')}
            defaultValue={0}
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
            <MenuItem value={0}>{t('Forever')}</MenuItem>
            <MenuItem value={0.5}>{t('Half an hour')}</MenuItem>
            <MenuItem value={1}>{t('1 hour')}</MenuItem>
            <MenuItem value={2}>{t('2 hours')}</MenuItem>
            <MenuItem value={6}>{t('6 hours')}</MenuItem>
            <MenuItem value={12}>{t('12 hours')}</MenuItem>
            <MenuItem value={24}>{t('1 day')}</MenuItem>
            <MenuItem value={24 * 7}>{t('1 week')}</MenuItem>
          </Select>
        </FormControl>
        <SubmitButton />
      </form>
    </div>
  );
}
