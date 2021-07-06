import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import GroupIcon from '@material-ui/icons/Group';
import { Typography, CircularProgress } from '@material-ui/core';

import { StaffShunt } from 'app/domain/StaffInfo';
import { gql, useMutation } from '@apollo/client';

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

interface FormProps {
  defaultValues: StaffShunt | undefined;
}

interface Graphql {
  saveStaffShunt: StaffShunt | undefined;
}

const MUTATION_STAFF_SHUNT = gql`
  mutation StaffShunt($staffShuntInput: StaffShuntInput!) {
    saveStaffShunt(staffShunt: $staffShuntInput) {
      id
      organizationId
      shuntClassId
      name
      code
    }
  }
`;

export default function StaffShuntForm(props: FormProps) {
  const { defaultValues } = props;
  const classes = useStyles();
  const { handleSubmit, register } = useForm<StaffShunt>({
    defaultValues,
  });

  const [saveStaffShunt, { loading, data }] =
    useMutation<Graphql>(MUTATION_STAFF_SHUNT);

  const onSubmit: SubmitHandler<StaffShunt> = (form) => {
    saveStaffShunt({ variables: { staffShuntInput: form } });
  };

  return (
    <div className={classes.paper}>
      {loading && <CircularProgress />}
      {data && <Typography>Success!</Typography>}
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveStaffShunt?.id || ''}
          name="id"
          type="hidden"
          inputRef={register({ maxLength: 100, valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          name="name"
          label="接待组名称"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          inputRef={register({
            required: '必须设置接待组名称',
            maxLength: {
              value: 50,
              message: '接待组名称不能大于50位',
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="code"
          name="code"
          label="接待组链接代码"
          value={defaultValues?.code || data?.saveStaffShunt?.code || ''}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          inputRef={register()}
        />
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
