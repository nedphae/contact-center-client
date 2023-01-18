/* eslint-disable react/jsx-props-no-spreading */
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import GroupIcon from '@material-ui/icons/Group';

import { StaffGroup } from 'renderer/domain/StaffInfo';
import { gql, useMutation } from '@apollo/client';
import { Object } from 'ts-toolbelt';
import useAlert from 'renderer/hook/alert/useAlert';
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

// 去除掉没用的循环属性
type FormType = Object.Omit<StaffGroup, 'staffList'>;

interface FormProps {
  defaultValues: FormType | undefined;
  refetch: () => void;
}

interface Graphql {
  saveStaffGroup: FormType;
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
  const { defaultValues, refetch } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const { handleSubmit, register } = useForm<FormType>({
    defaultValues,
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveStaffGroup, { loading, data }] = useMutation<Graphql>(
    MUTATION_STAFF_GROUP,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding('Saving');
  }

  const onSubmit: SubmitHandler<FormType> = async (form) => {
    await saveStaffGroup({
      variables: { staffGroupInput: _.omit(form, '__typename') },
    });
    refetch();
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveStaffGroup.id || ''}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="groupName"
          label={t('Group Name')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          {...register('groupName', {
            required: t('Group name must be set'),
            maxLength: {
              value: 50,
              message: t('Group name cannot be greater than 50 characters'),
            },
          })}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
