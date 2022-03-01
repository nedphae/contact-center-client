/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import { CssBaseline, FormControl } from '@material-ui/core';
import DropdownTreeSelect from 'react-dropdown-tree-select';

import { makeTreeNode, TopicCategory } from 'app/domain/Bot';
import useAlert from 'app/hook/alert/useAlert';
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
type FormType = Object.Omit<TopicCategory, 'children'>;

interface FormProps {
  defaultValues: FormType | undefined;
  allTopicCategoryList: FormType[];
}

interface Graphql {
  saveTopicCategory: FormType;
}

const MUTATION = gql`
  mutation TopicCategory($topicCategoryInput: TopicCategoryInput!) {
    saveTopicCategory(topicCategory: $topicCategoryInput) {
      id
      name
      knowledgeBaseId
      pid
    }
  }
`;

export default function TopicCategoryForm(props: FormProps) {
  const { defaultValues, allTopicCategoryList } = props;
  const classes = useStyles();
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm<FormType>({
    defaultValues,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveTopicCategory, { loading, data }] = useMutation<Graphql>(
    MUTATION,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<TopicCategory> = (form) => {
    saveTopicCategory({ variables: { topicCategoryInput: form } });
  };

  const treeData = useMemo(
    () =>
      makeTreeNode(
        allTopicCategoryList,
        data?.saveTopicCategory.pid || defaultValues?.pid
      ),
    [data, defaultValues, allTopicCategoryList]
  );

  return (
    <div className={classes.paper}>
      <CssBaseline />
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={data?.saveTopicCategory.id || defaultValues?.id || ''}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />
        <TextField
          value={
            data?.saveTopicCategory.knowledgeBaseId ||
            defaultValues?.knowledgeBaseId ||
            ''
          }
          type="hidden"
          {...register('knowledgeBaseId', { valueAsNumber: true })}
        />
        <TextField
          value={data?.saveTopicCategory.pid || defaultValues?.pid || ''}
          type="hidden"
          {...register('pid', { valueAsNumber: true })}
        />
        <FormControl variant="outlined" margin="normal" fullWidth>
          <DropdownTreeSelect
            inlineSearchInput
            data={treeData}
            onChange={(_currentNode, selectedNodes) => {
              setValue(
                'pid',
                parseInt(selectedNodes.map((it) => it.value)[0], 10)
              );
            }}
            texts={{ placeholder: '选择上级分类' }}
            className="mdl-demo"
            mode="radioSelect"
          />
        </FormControl>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          label="分类名称"
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
            maxLength: {
              value: 500,
              message: '分类名称 长度不能大于500个字符',
            },
          })}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
