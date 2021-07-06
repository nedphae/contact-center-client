import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

import { CircularProgress, Typography } from '@material-ui/core';

import { KnowledgeBase } from 'app/domain/Bot';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    formControl: {
      margin: theme.spacing(1),
      width: '100%', // Fix IE 11 issue.
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
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
      {loading && <CircularProgress />}
      {data && <Typography>Success!</Typography>}
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
          helperText={errors.name}
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
          helperText={errors.description}
          inputRef={register({
            maxLength: {
              value: 500,
              message: '知识库描述 长度不能大于500个字符',
            },
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
