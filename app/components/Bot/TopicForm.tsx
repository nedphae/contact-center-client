import React, { useMemo } from 'react';
import _ from 'lodash';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlProps,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';

import { makeTreeNode, Topic, TopicCategory } from 'app/domain/Bot';
import DropdownTreeSelect, { TreeNodeProps } from 'react-dropdown-tree-select';
import useAlert from 'app/hook/alert/useAlert';
import ChipSelect, { SelectKeyValue } from '../Form/ChipSelect';
import SubmitButton from '../Form/SubmitButton';
import { getUploadOssChatImgPath } from 'app/config/clientConfig';

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
  defaultValues: Topic | undefined;
  topicList: Topic[];
  categoryList: TopicCategory[];
}

interface Graphql {
  saveTopic: Topic;
}

const MUTATION_TOPIC = gql`
  mutation Staff($topicInput: TopicInput!) {
    saveTopic(topic: $topicInput) {
      id
      knowledgeBaseId
      question
      md5
      answer {
        type
        content
      }
      innerAnswer
      fromType
      type
      refId
      connectIds
      enabled
      effectiveTime
      failureTime
      categoryId
      faqType
    }
  }
`;

export default function TopicForm(props: FormProps) {
  const { defaultValues, topicList, categoryList } = props;
  const classes = useStyles();
  const {
    handleSubmit,
    register,
    control,
    watch,
    errors,
    getValues,
    setValue,
  } = useForm<Topic>({
    defaultValues,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveTopic, { loading, data }] = useMutation<Graphql>(MUTATION_TOPIC, {
    onCompleted,
    onError,
  });
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<Topic> = (form) => {
    saveTopic({ variables: { topicInput: form } });
  };

  const questionType = watch('type', 1);
  const picSrc = watch('answer.1.content');

  const imgUploadProps = {
    action: `${getUploadOssChatImgPath()}`,
    multiple: false,
    accept: 'image/png,image/gif,image/jpeg',
    onStart(file: RcFile) {},
    onSuccess(response: unknown, file: RcFile, _xhr: unknown) {
      // 设置图片地址
      setValue('answer.1.content', (response as string[])[0]);
    },
    onError(error: Error, _ret: any, _file: RcFile) {},
  };

  const id = data?.saveTopic.id || defaultValues?.id || '';
  // 过滤自身
  const filterTopicList = topicList.filter((it) => it.id !== id);

  const selectKeyValueList: SelectKeyValue[] = [
    {
      label: '关联问题',
      name: 'connectIds',
      selectList: _.zipObject(
        filterTopicList.map((it) => it.id ?? ''),
        filterTopicList.map((it) => it.question)
      ),
      defaultValue: defaultValues?.connectIds ?? [],
    },
  ];

  const handleDelete = (name: string, value: string) => {
    const values = getValues(name) as string[];
    setValue(
      name,
      _.remove(values, (v) => v !== value)
    );
  };

  const dropdownTreeSelect = useMemo(() => {
    // 防止 DropdownTreeSelect 多次刷新
    const treeData = makeTreeNode(
      categoryList,
      data?.saveTopic.categoryId || defaultValues?.categoryId,
      (topicCategory: TopicCategory, node: TreeNodeProps) => {
        node.knowledgeBaseId = topicCategory.knowledgeBaseId;
      }
    );
    return (
      <DropdownTreeSelect
        inlineSearchInput
        data={treeData}
        onChange={(_currentNode, selectedNodes) => {
          // setValue(
          //   'knowledgeBaseId',
          //   selectedNodes.map((it) => it.knowledgeBaseId)[0]
          // );
          setValue('categoryId', selectedNodes.map((it) => it.value)[0]);
        }}
        texts={{ placeholder: '选择所属分类' }}
        className="mdl-demo"
        mode="radioSelect"
      />
    );
  }, [data, categoryList, defaultValues, setValue]);

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField value={id} name="id" type="hidden" inputRef={register()} />
        <TextField
          defaultValue={
            data?.saveTopic.categoryId || defaultValues?.categoryId || ''
          }
          name="categoryId"
          type="hidden"
          error={errors.categoryId && true}
          helperText={errors.categoryId?.message}
          inputRef={register({
            required: '必须选择知识库分类',
            valueAsNumber: true,
          })}
        />
        <TextField
          defaultValue={
            data?.saveTopic.knowledgeBaseId ||
            defaultValues?.knowledgeBaseId ||
            ''
          }
          name="knowledgeBaseId"
          type="hidden"
          inputRef={register({
            required: '必须选择知识库',
            valueAsNumber: true,
          })}
        />
        <FormControl variant="outlined" margin="normal" fullWidth>
          {dropdownTreeSelect}
        </FormControl>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          id="question"
          name="question"
          label="问题"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QuestionAnswerIcon />
              </InputAdornment>
            ),
          }}
          error={errors.question && true}
          helperText={errors.question?.message}
          inputRef={register({
            required: '问题必填',
            maxLength: {
              value: 500,
              message: '问题长度不能大于500个字符',
            },
          })}
        />
        <Controller
          control={control}
          name="type"
          defaultValue={1}
          render={({ onChange, value }) => (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="demo-mutiple-chip-label">问题类型</InputLabel>
              <Select
                labelId="type"
                id="type"
                onChange={onChange}
                value={value}
                label="问题类型"
              >
                <MenuItem value={1}>标准问题</MenuItem>
                <MenuItem value={2}>相似问题</MenuItem>
              </Select>
            </FormControl>
          )}
        />
        {questionType === 1 && (
          <>
            <TextField
              name="answer.0.type"
              type="hidden"
              defaultValue="text"
              inputRef={register()}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              multiline
              id="answer.0.content"
              name="answer.0.content"
              label="问题的对外答案"
              error={errors.answer && true}
              helperText={errors.answer && errors.answer[0]?.content?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QuestionAnswerIcon />
                  </InputAdornment>
                ),
              }}
              inputRef={register()}
            />
            <TextField
              name="answer.1.type"
              type="hidden"
              defaultValue="image"
              inputRef={register()}
            />
            <TextField
              name="answer.1.content"
              type="hidden"
              inputRef={register()}
            />
            {picSrc && <img src={picSrc} alt="图片消息" />}
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              multiline
              id="innerAnswer"
              name="innerAnswer"
              label="问题的对内答案"
              error={errors.innerAnswer && true}
              helperText={errors.innerAnswer?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QuestionAnswerIcon />
                  </InputAdornment>
                ),
              }}
              inputRef={register()}
            />
            <ChipSelect
              selectKeyValueList={selectKeyValueList}
              control={control}
              handleDelete={handleDelete}
              CustomerFormControl={(formControlProps: FormControlProps) => (
                <FormControl
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...formControlProps}
                />
              )}
            />
          </>
        )}
        {questionType === 2 && (
          <Controller
            control={control}
            name="refId"
            defaultValue={null}
            rules={{ required: '相似问题必选' }}
            render={({ onChange, value }, { invalid }) => (
              <FormControl
                variant="outlined"
                margin="normal"
                fullWidth
                error={invalid}
              >
                <InputLabel id="demo-mutiple-chip-label">相似问题</InputLabel>
                <Select
                  labelId="refId"
                  id="refId"
                  onChange={onChange}
                  value={value || ''}
                  label="相似问题"
                >
                  <MenuItem>
                    <em>None</em>
                  </MenuItem>
                  {filterTopicList &&
                    filterTopicList.map((it) => {
                      return (
                        <MenuItem key={it.id} value={it.id}>
                          {it.question}
                        </MenuItem>
                      );
                    })}
                </Select>
                {invalid && <FormHelperText>Error</FormHelperText>}
              </FormControl>
            )}
          />
        )}
        <Controller
          control={control}
          defaultValue
          name="enabled"
          render={({ onChange, value }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              }
              label="是否启用"
            />
          )}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
