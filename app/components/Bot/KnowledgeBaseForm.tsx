import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

import { KnowledgeBase } from 'app/domain/Bot';
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
  defaultValues: KnowledgeBase | undefined;
}

interface Graphql {
  saveKnowledgeBase: KnowledgeBase;
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
  const { handleSubmit, register, errors } = useForm<KnowledgeBase>({
    defaultValues,
  });

  const [saveKnowledgeBase, { loading, data }] = useMutation<Graphql>(MUTATION);

  const onSubmit: SubmitHandler<KnowledgeBase> = (form) => {
    saveKnowledgeBase({ variables: { knowledgeBaseInput: form } });
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveKnowledgeBase.id || ''}
          name="id"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          name="name"
          label="知识库名称"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QuestionAnswerIcon />
              </InputAdornment>
            ),
          }}
          error={errors.name && true}
          helperText={errors.name?.message}
          inputRef={register({
            required: '必须提供知识库名称',
            maxLength: {
              value: 200,
              message: '知识库名称 长度不能大于500个字符',
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="description"
          name="description"
          label="知识库描述"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QuestionAnswerIcon />
              </InputAdornment>
            ),
          }}
          error={errors.description && true}
          helperText={errors.description?.message}
          inputRef={register({
            maxLength: {
              value: 500,
              message: '知识库描述 长度不能大于500个字符',
            },
          })}
        />
        <SubmitButton loading={loading} success={Boolean(data)} />
      </form>
    </div>
  );
}
