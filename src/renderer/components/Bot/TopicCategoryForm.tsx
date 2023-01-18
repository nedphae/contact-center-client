/* eslint-disable react/jsx-props-no-spreading */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import { CssBaseline, FormControl } from '@material-ui/core';
import DropdownTreeSelect from 'react-dropdown-tree-select';

import { makeTreeNode, TopicCategory } from 'renderer/domain/Bot';
import useAlert from 'renderer/hook/alert/useAlert';
import _ from 'lodash';
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
  refetch: () => void;
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
  const { defaultValues, allTopicCategoryList, refetch } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm<FormType>({
    defaultValues,
    shouldUnregister: true,
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
    onLoadding('Saving');
  }

  const onSubmit: SubmitHandler<TopicCategory> = async (form) => {
    await saveTopicCategory({ variables: { topicCategoryInput: form } });
    refetch();
  };

  const treeData = useMemo(() => {
    const filterId = allTopicCategoryList.filter(
      (it) => it.id !== defaultValues?.id
    );
    const topicCategoryPidGroup = _.groupBy(filterId, (it) => it.pid);
    const topicCategoryList = filterId
      ?.map((it) => {
        const children = topicCategoryPidGroup[it.id ?? -1];
        return _.defaults({ children }, it);
      })
      .filter((it) => it.pid === undefined || it.pid === null);

    return makeTreeNode(
      topicCategoryList.filter(
        (it) => it.knowledgeBaseId === defaultValues?.knowledgeBaseId
      ),
      data?.saveTopicCategory.pid || defaultValues?.pid
    );
  }, [data, defaultValues, allTopicCategoryList]);

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
            texts={{ placeholder: t('Select a parent category') }}
            className="mdl-demo"
            mode="radioSelect"
          />
        </FormControl>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          label={t('KB Category name')}
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
              message: t('Category name length cannot exceed 500 characters'),
            },
          })}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
