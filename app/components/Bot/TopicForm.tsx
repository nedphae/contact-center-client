/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import _ from 'lodash';
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
  Control,
} from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormControlProps,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import Upload from 'rc-upload';

import { makeTreeNode, Topic, TopicCategory } from 'app/domain/Bot';
import DropdownTreeSelect, { TreeNodeProps } from 'react-dropdown-tree-select';
import useAlert from 'app/hook/alert/useAlert';
import {
  getDownloadS3ChatImgPath,
  getUploadS3ChatImgPath,
} from 'app/config/clientConfig';
import { RcFile } from 'rc-upload/lib/interface';
import ChipSelect, { SelectKeyValue } from '../Form/ChipSelect';
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
  defaultValues: Topic | undefined;
  topicList: Topic[];
  categoryList: TopicCategory[];
  afterSubmit: () => void;
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
  const { defaultValues, topicList, categoryList, afterSubmit } = props;
  const classes = useStyles();
  const {
    handleSubmit,
    register,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<Topic>({
    defaultValues: _.omitBy(defaultValues, _.isNull),
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError, onErrorMsg } = useAlert();
  const [saveTopic, { loading, data }] = useMutation<Graphql>(MUTATION_TOPIC, {
    onCompleted,
    onError,
  });
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<Topic> = async (form) => {
    await saveTopic({ variables: { topicInput: form } });
    afterSubmit();
    // const filterObj = _.defaults(
    //   { answer: form?.answer?.map((ans) => _.omit(ans, '__typename')) },
    //   _.omit(form, '__typename', 'categoryName', 'knowledgeBaseName')
    // );
    // await saveTopic({
    //   variables: {
    //     topicInput: filterObj,
    //   },
    // });
  };

  const questionType = watch('type', defaultValues?.type ?? 1);
  const { fields, update, remove } = useFieldArray({ name: 'answer', control });
  const picSrc = fields[1]?.content;

  const imgUploadProps = {
    action: `${getUploadS3ChatImgPath()}`,
    multiple: false,
    accept: 'image/png,image/gif,image/jpeg',
    onSuccess(response: unknown) {
      // 设置图片地址
      update(1, { type: 'image', content: (response as string[])[0] });
    },
    onError(error: Error, _ret: any, _file: RcFile) {
      onErrorMsg('图片上传失败');
    },
  };

  function handleDeletePic() {
    remove(1);
  }

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

  const handleDelete = (name: keyof Topic, value: string) => {
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
          setValue(
            'knowledgeBaseId',
            selectedNodes.map((it) => it.knowledgeBaseId)[0]
          );
          setValue(
            'categoryId',
            parseInt(selectedNodes.map((it) => it.value)[0], 10)
          );
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
        <TextField value={id} type="hidden" {...register('id')} />
        <TextField
          defaultValue={
            data?.saveTopic.categoryId || defaultValues?.categoryId || ''
          }
          type="hidden"
          error={errors.categoryId && true}
          helperText={errors.categoryId?.message}
          {...register('categoryId', {
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
          error={errors.knowledgeBaseId && true}
          helperText={errors.knowledgeBaseId?.message}
          type="hidden"
          {...register('knowledgeBaseId', {
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
          {...register('question', {
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
          render={({ field: { onChange, value } }) => (
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
              type="hidden"
              defaultValue="text"
              {...register('answer.0.type')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              multiline
              id="answer.0.content"
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
              {...register('answer.0.content')}
            />
            <TextField
              type="hidden"
              defaultValue="image"
              {...register('answer.1.type')}
            />
            <TextField type="hidden" {...register('answer.1.content')} />
            {picSrc && (
              <img
                src={`${getDownloadS3ChatImgPath()}${picSrc}`}
                style={{ maxWidth: '400px' }}
                alt="图片消息"
              />
            )}

            <Grid container alignItems="center">
              <Upload {...imgUploadProps}>
                <Button variant="contained" color="primary">
                  添加图片
                </Button>
              </Upload>
              <Divider orientation="vertical" />
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeletePic}
              >
                删除图片
              </Button>
            </Grid>

            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              multiline
              id="innerAnswer"
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
              {...register('innerAnswer')}
            />
            <ChipSelect
              selectKeyValueList={selectKeyValueList}
              control={
                control as unknown as Control<Record<string, unknown>, unknown>
              }
              handleDelete={
                handleDelete as (name: string, value: string) => void
              }
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
            defaultValue={undefined}
            rules={{ required: '相似问题必选' }}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error: refIdError },
            }) => (
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
                {invalid && (
                  <FormHelperText>{refIdError?.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        )}
        <Controller
          control={control}
          defaultValue
          name="enabled"
          render={({ field: { onChange, value } }) => (
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
