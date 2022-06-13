/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
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
          {...register('name', {
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
          {...register('description', {
            maxLength: {
              value: 500,
              message: '知识库描述 长度不能大于500个字符',
            },
          })}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
