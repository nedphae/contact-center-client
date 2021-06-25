import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import GroupIcon from '@material-ui/icons/Group';
import { Typography, CircularProgress } from '@material-ui/core';

import { StaffGroup } from 'app/domain/StaffInfo';
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
  defaultValues: StaffGroup;
}

interface Graphql {
  saveStaffGroup: StaffGroup;
}

const MUTATION_STAFF_GROUP = gql`
  mutation StaffGroup($staffGroupInput: StaffGroupInput!) {
    saveStaffGroup(staffGroup: $staffGroupInput) {
      id
      organizationId
      groupName
    }
  }
`;

export default function StaffGroupForm(props: FormProps) {
  const { defaultValues } = props;
  const classes = useStyles();
  const { handleSubmit, register } = useForm<StaffGroup>({
    defaultValues,
  });

  const [saveStaffGroup, { loading, data }] =
    useMutation<Graphql>(MUTATION_STAFF_GROUP);

  const onSubmit: SubmitHandler<StaffGroup> = (form) => {
    saveStaffGroup({ variables: { staffGroupInput: form } });
  };

  return (
    <div className={classes.paper}>
      {loading && <CircularProgress />}
      {data && <Typography>Success!</Typography>}
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues.id || data?.saveStaffGroup.id || ''}
          name="id"
          type="hidden"
          inputRef={register({ maxLength: 100, valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="groupName"
          name="groupName"
          label="分组名称"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          inputRef={register({
            maxLength: 50,
          })}
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
