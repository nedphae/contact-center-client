/* eslint-disable react/jsx-props-no-spreading */
import _ from 'lodash';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import { useMutation } from '@apollo/client';
import useAlert from 'renderer/hook/alert/useAlert';
import {
  MUTATION_WECHAT_INFO,
  UpdateWeChatOpenInfoGraphql,
  WeChatOpenInfo,
} from 'renderer/domain/WeChatOpenInfo';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { StaffShunt } from 'renderer/domain/StaffInfo';

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

// 去除掉没用的循环属性
type FormType = WeChatOpenInfo;

interface FormProps {
  defaultValues: FormType | undefined;
  refetch: () => void;
  shuntList: StaffShunt[];
}

export default function WeChatOpenInfoForm(props: FormProps) {
  const { defaultValues, refetch, shuntList } = props;
  const classes = useStyles();
  const { handleSubmit, register, control } = useForm<FormType>({
    defaultValues,
    // shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [updateWeChatOpenInfo, { loading, data }] =
    useMutation<UpdateWeChatOpenInfoGraphql>(MUTATION_WECHAT_INFO, {
      onCompleted,
      onError,
    });
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<FormType> = async (form) => {
    await updateWeChatOpenInfo({
      variables: { weChatOpenInfo: _.omit(form, '__typename') },
    });
    refetch();
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.updateWeChatOpenInfo.id || ''}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />

        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="nickName"
          label="微信昵称"
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          {...register('nickName')}
        />

        <Controller
          control={control}
          name="shuntId"
          render={({
            field: { onChange, value },
            fieldState: { error: groupIdError },
          }) => (
            <FormControl
              variant="outlined"
              margin="normal"
              fullWidth
              error={Boolean(groupIdError)}
            >
              <InputLabel id="demo-mutiple-chip-label">关联接待组</InputLabel>
              <Select
                labelId="shuntId"
                id="shuntId"
                onChange={onChange}
                defaultValue=""
                value={value}
                label="关联接待组"
              >
                {shuntList.map((it) => {
                  return (
                    <MenuItem key={it.id} value={it.id}>
                      {it.name}
                    </MenuItem>
                  );
                })}
              </Select>
              {groupIdError && (
                <FormHelperText>{groupIdError?.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
