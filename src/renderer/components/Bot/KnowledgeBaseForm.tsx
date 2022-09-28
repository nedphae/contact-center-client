/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from 'react-i18next';

import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

import { KnowledgeBase } from 'renderer/domain/Bot';
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
type FormType = Object.Omit<KnowledgeBase, 'categoryList'>;

interface FormProps {
  defaultValues: FormType | undefined;
}

interface Graphql {
  saveKnowledgeBase: FormType;
}

const MUTATION = gql`
  mutation KnowledgeBase($knowledgeBaseInput: KnowledgeBaseInput!) {
    saveKnowledgeBase(knowledgeBase: $knowledgeBaseInput) {
      id
      name
      description
    }
  }
`;

export default function KnowledgeBaseForm(props: FormProps) {
  const { defaultValues } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues,
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveKnowledgeBase, { loading, data }] = useMutation<Graphql>(
    MUTATION,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<FormType> = (form) => {
    saveKnowledgeBase({ variables: { knowledgeBaseInput: form } });
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveKnowledgeBase.id || ''}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          label={t('Knowledge base name')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QuestionAnswerIcon />
              </InputAdornment>
            ),
          }}
          error={errors.name && true}
          helperText={errors.name?.message}
          {...register('name', {
            required: t('Knowledge base name is required'),
            maxLength: {
              value: 200,
              message: t(
                'Knowledge base name length cannot be greater than 500 characters'
              ),
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="description"
          label={t('Knowledge base description')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QuestionAnswerIcon />
              </InputAdornment>
            ),
          }}
          error={errors.description && true}
          helperText={errors.description?.message}
          {...register('description', {
            maxLength: {
              value: 500,
              message: t(
                'Knowledge base description length cannot exceed 500 characters'
              ),
            },
          })}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
