import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import GroupIcon from '@material-ui/icons/Group';

import { StaffGroup } from 'app/domain/StaffInfo';
import { gql, useMutation } from '@apollo/client';
import SubmitButton from '../Form/SubmitButton';

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
  defaultValues: StaffGroup | undefined;
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
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveStaffGroup.id || ''}
          name="id"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
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
            required: '必须设置分组名称',
            maxLength: {
              value: 50,
              message: '分组名称不能大于50位',
            },
          })}
        />
        <SubmitButton loading={loading} success={Boolean(data)} />
      </form>
    </div>
  );
}
