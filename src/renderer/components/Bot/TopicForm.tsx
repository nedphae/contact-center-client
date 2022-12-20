/* eslint-disable react/jsx-props-no-spreading */
import React, { ChangeEvent, Dispatch, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import _ from 'lodash';
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
} from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import Alert from '@material-ui/lab/Alert';

import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from '@material-ui/core';
import Upload from 'rc-upload';

import { makeTreeNode, Topic, TopicCategory } from 'renderer/domain/Bot';
import DropdownTreeSelect, { TreeNodeProps } from 'react-dropdown-tree-select';
import useAlert from 'renderer/hook/alert/useAlert';
import {
  getDownloadS3ChatImgPath,
  getUploadS3ChatPath,
} from 'renderer/config/clientConfig';
import { RcFile } from 'rc-upload/lib/interface';
import SwipeableViews from 'react-swipeable-views';
import { Autocomplete } from '@material-ui/lab';
import { IDomEditor } from '@wangeditor/editor';
import { SelectKeyValue } from '../Form/ChipSelect';
import SubmitButton from '../Form/SubmitButton';
import RichText from './RichText';

interface TabPanelProps {
  children: React.ReactNode;
  dir: string | undefined;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {/* 全部渲染，防止造成表单未注册 */}
      {/* {value === index && <Box p={1}>{children}</Box>} */}
      <Box p={1}>{children}</Box>
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    answer: {
      backgroundColor: theme.palette.background.paper,
      width: '800px',
    },
    root: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    alert: {
      marginTop: theme.spacing(2),
      width: '800px',
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
  const {
    defaultValues: defaultTopic,
    topicList,
    categoryList,
    afterSubmit,
  } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useTranslation();

  const [defaultValues, setDefaultValues] = useState(
    _.omitBy(defaultTopic, _.isNull)
  );
  const {
    handleSubmit,
    register,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<Topic>({
    defaultValues,
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

  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_event: ChangeEvent<unknown>, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setTabIndex(index);
  };

  const onSubmit: SubmitHandler<Topic> = async (form) => {
    form.answer = form.answer?.map((answer) => {
      return {
        type: answer.type,
        content: answer.content || '',
      };
    });
    form.refQuestionList =
      form.refList
        ?.filter((it) => it.question !== '')
        ?.map((refQ) => refQ.question) ?? [];
    await saveTopic({ variables: { topicInput: _.omit(form, 'refList') } });
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
  const {
    fields: refList,
    append: appendRef,
    remove: removeRef,
  } = useFieldArray({
    name: 'refList',
    control,
  });

  function removeRefQuestion(index: number) {
    removeRef(index);
  }

  function appendRefQuestion() {
    appendRef({ question: '' });
  }

  const { fields, update, remove } = useFieldArray({ name: 'answer', control });
  const picSrc = fields[1]?.content;
  const html = fields[2]?.content;

  const setHtml: Dispatch<IDomEditor> = (currentHtml: IDomEditor) => {
    if (!currentHtml.isEmpty()) {
      update(2, { type: 'html', content: currentHtml.getHtml() });
    } else {
      remove(2);
    }
  };

  const imgUploadProps = {
    action: `${getUploadS3ChatPath()}`,
    multiple: false,
    accept: 'image/*',
    onSuccess(response: unknown) {
      // 设置图片地址
      update(1, { type: 'image', content: (response as string[])[0] });
    },
    onError(error: Error, _ret: any, _file: RcFile) {
      onErrorMsg('Image upload failed');
    },
  };

  function handleDeletePic() {
    update(1, { type: 'image', content: '' });
  }

  const id = data?.saveTopic.id || defaultValues?.id || '';
  // 过滤自身
  const filterTopicList = topicList.filter(
    (it) =>
      it.id !== id && it.knowledgeBaseId === defaultValues?.knowledgeBaseId
  );

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
          const knowledgeBaseId = selectedNodes.map(
            (it) => it.knowledgeBaseId
          )[0];
          const categoryId = parseInt(
            selectedNodes.map((it) => it.value)[0],
            10
          );
          setValue('knowledgeBaseId', knowledgeBaseId);
          setValue('categoryId', categoryId);
          setDefaultValues(
            _.defaults(
              {
                categoryId,
                knowledgeBaseId,
              },
              defaultTopic
            )
          );
        }}
        texts={{ placeholder: t('Select the category') }}
        className="mdl-demo"
        mode="radioSelect"
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, categoryList, defaultValues, setValue, setDefaultValues]);

  return (
    <div className={classes.root}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField value={id} type="hidden" {...register('id')} />
        <TextField
          value={data?.saveTopic.categoryId || defaultValues?.categoryId || ''}
          type="hidden"
          error={errors.categoryId && true}
          helperText={errors.categoryId?.message}
          {...register('categoryId', {
            required: t('Knowledge base category must be selected'),
            valueAsNumber: true,
          })}
        />
        <TextField
          value={
            data?.saveTopic.knowledgeBaseId ||
            defaultValues?.knowledgeBaseId ||
            ''
          }
          // error={errors.knowledgeBaseId && true}
          helperText={errors.knowledgeBaseId?.message}
          type="hidden"
          {...register('knowledgeBaseId', {
            required: t('Knowledge base must be selected'),
            valueAsNumber: true,
          })}
        />
        <FormControl variant="outlined" margin="normal" fullWidth>
          {dropdownTreeSelect}
        </FormControl>
        <TextField
          defaultValue={1}
          type="hidden"
          {...register('type', { valueAsNumber: true })}
        />
        {/* <Controller
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
        /> */}
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          id="question"
          label={t('Question')}
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
            required: t('Question required'),
            maxLength: {
              value: 500,
              message: t(
                'Question length cannot be greater than 500 characters'
              ),
            },
          })}
        />
        {refList &&
          refList.map((refTopic, index) => (
            <Grid
              key={refTopic.id}
              container
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={11}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  multiline
                  label={t('Similar question')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QuestionAnswerIcon />
                      </InputAdornment>
                    ),
                  }}
                  error={errors.refList && errors.refList[index] && true}
                  helperText={
                    errors.refList &&
                    errors.refList[index] &&
                    errors.refList[index]?.question?.message
                  }
                  {...register(`refList.${index}.question`, {
                    required: t('Similar questions are required'),
                    maxLength: {
                      value: 500,
                      message: t(
                        'Question length cannot be greater than 500 characters'
                      ),
                    },
                  })}
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  aria-label="delete"
                  style={{ height: '100%' }}
                  onClick={() => {
                    removeRefQuestion(index);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        <Button onClick={appendRefQuestion} startIcon={<AddIcon />}>
          {t('Add similar questions')}
        </Button>
        <Alert severity="info" className={classes.alert}>
          {t(
            'Graphical and rich text answers can exist at the same time, the order is text first, then pictures, and finally rich text. If the corresponding answer is empty, it will not be displayed.'
          )}
          <br />
          {t(
            'If you need to configure the question to be transferred to manual, you only need to leave all external answers blank.'
          )}
        </Alert>
        {questionType === 1 && (
          <>
            <div className={classes.answer}>
              <TextField
                type="hidden"
                defaultValue="text"
                {...register('answer.0.type')}
              />
              <TextField
                type="hidden"
                defaultValue="image"
                {...register('answer.1.type')}
              />
              <AppBar position="static" color="default">
                <Tabs
                  value={tabIndex}
                  onChange={handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                >
                  <Tab
                    label={t('Graphical and text answer')}
                    {...a11yProps(0)}
                  />
                  <Tab label={t('Rich text answer')} {...a11yProps(1)} />
                </Tabs>
              </AppBar>
              <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={tabIndex}
                onChangeIndex={handleChangeIndex}
              >
                <TabPanel value={tabIndex} index={0} dir={theme.direction}>
                  {/* 图文答案 */}
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    multiline
                    label={t('External answer')}
                    error={errors.answer && true}
                    helperText={
                      errors.answer && errors.answer[0]?.content?.message
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <QuestionAnswerIcon />
                        </InputAdornment>
                      ),
                    }}
                    {...register('answer.0.content')}
                  />
                  <TextField type="hidden" {...register('answer.1.content')} />
                  {picSrc && (
                    <img
                      src={`${getDownloadS3ChatImgPath()}${picSrc}`}
                      style={{ maxWidth: '400px' }}
                      alt="Message"
                    />
                  )}

                  <Grid container alignItems="center">
                    <Upload {...imgUploadProps}>
                      <Button variant="contained" color="primary">
                        {t('Add picture')}
                      </Button>
                    </Upload>
                    <Divider orientation="vertical" />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDeletePic}
                    >
                      {t('Delete picture')}
                    </Button>
                  </Grid>
                </TabPanel>
                <TabPanel value={tabIndex} index={1} dir={theme.direction}>
                  <TextField
                    type="hidden"
                    defaultValue="html"
                    {...register('answer.2.type')}
                  />
                  <RichText html={html} setHtml={setHtml} />
                </TabPanel>
              </SwipeableViews>
            </div>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              multiline
              id="innerAnswer"
              label={t('Internal answers')}
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
            {/* <ChipSelect
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
            /> */}
            {/* 废弃上面的ChipSelect，改为使用 Autocomplete */}
            <Controller
              control={control}
              name="connectIds"
              defaultValue={undefined}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  id="tags-outlined"
                  options={topicList}
                  getOptionLabel={(option) => option.question}
                  value={topicList.filter((it) => value?.includes(it.id ?? ''))}
                  onChange={(_event, newValue) => {
                    onChange(newValue.map((it) => it.id));
                  }}
                  className={classes.alert}
                  noOptionsText={t('No matching questions')}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={t('Association questions')}
                      placeholder={t('Please select associated questions')}
                    />
                  )}
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
            rules={{ required: t('Similar questions required') }}
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
                <InputLabel id="demo-mutiple-chip-label">
                  {t('Similar questions')}
                </InputLabel>
                <Select
                  labelId="refId"
                  id="refId"
                  onChange={onChange}
                  value={value || ''}
                  label={t('Similar questions')}
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
              control={(
                <Checkbox
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              )}
              label={t('Enable?')}
            />
          )}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
