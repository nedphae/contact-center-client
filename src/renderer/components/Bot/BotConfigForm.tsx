/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import _, { debounce } from 'lodash';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { BotConfig } from 'renderer/domain/Bot';
import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  Slider,
  Switch,
  Typography,
} from '@material-ui/core';
import {
  BotMutationGraphql,
  MUTATION_BOT_CONFIG,
  QUERY_TOPIC_BY_IDS,
  SEARCH_TOPIC,
  TopicByIdsGraphql,
  TopicFilterInput,
  TopicFilterInputGraphql,
  TopicPageGraphql,
} from 'renderer/domain/graphql/Bot';
import { Autocomplete } from '@material-ui/lab';
import { PageParam } from 'renderer/domain/graphql/Query';
import SubmitButton from '../Form/SubmitButton';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    form: {
      width: '100%',
    },
    divider: {
      marginTop: '0.5rem',
      marginBottom: '0.5rem',
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    alert: {
      marginTop: theme.spacing(2),
    },
  })
);

interface FormProps {
  defaultValues: BotConfig;
  afterMutationCallback: () => void | undefined;
}

export default function BotConfigForm(props: FormProps) {
  const { defaultValues, afterMutationCallback } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<BotConfig>({
    defaultValues,
    shouldUnregister: true,
  });

  const topicFilterInput: TopicFilterInput = {
    keyword: '',
    knowledgeBaseId: defaultValues.knowledgeBaseId,
    // 只查询标准问题
    type: 1,
    page: new PageParam(0, 10, 'DESC', ['createdDate']),
  };

  const hotQuesionIds = defaultValues?.hotQuestion?.split(',') ?? [];

  const { data: hotQuesions } = useQuery<TopicByIdsGraphql>(
    QUERY_TOPIC_BY_IDS,
    {
      variables: {
        ids: hotQuesionIds,
      },
    }
  );

  const {
    data: searchTopicData,
    loading: loadingTopic,
    refetch: refetchTopic,
    variables,
  } = useQuery<TopicPageGraphql, TopicFilterInputGraphql>(SEARCH_TOPIC, {
    variables: { topicFilterInput },
    fetchPolicy: 'no-cache',
  });

  const searchTopic = searchTopicData?.searchTopic;
  const topicList =
    searchTopic && searchTopic.content
      ? searchTopic.content.map((it) => it.content)
      : [];

  const [saveBotConfig, { data }] =
    useMutation<BotMutationGraphql>(MUTATION_BOT_CONFIG);

  const onSubmit: SubmitHandler<BotConfig> = async (form) => {
    if (form.hotQuestionList) {
      const tempHotQuestion = form.hotQuestionList.map((it) => it.id).join(',');
      form.hotQuestion = tempHotQuestion;
    }
    await toast.promise(
      saveBotConfig({
        variables: {
          botConfigInput: _.omit(form, '__typename', 'hotQuestionList'),
        },
      }),
      {
        pending: t('Saving'),
        success: t('Success'),
        error: t('Fail'),
      }
    );
    afterMutationCallback();
  };

  const fetchTopic = useMemo(
    () =>
      debounce((topicFilterInputParam: TopicFilterInput) => {
        refetchTopic({
          topicFilterInput: topicFilterInputParam,
        });
      }, 400),
    [refetchTopic]
  );

  const hotQuestionList = hotQuesions?.getTopicByIds;

  return (
    <div className={classes.paper}>
      <form
        className={classes.form}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={classes.form}>
          <Typography variant="subtitle1" gutterBottom>
            {t('Problem accuracy')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t(
              '0 means not to detect the problem accuracy, 1 means the problem should be completely matched, the default is 0.9. The system will return the top 1 answers with a higher precision than this'
            )}
          </Typography>
          <Controller
            control={control}
            name="questionPrecision"
            defaultValue={0.9}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error: questionPrecisionError },
            }) => (
              <>
                <Slider
                  className={classes.form}
                  value={value}
                  onChange={(
                    _event: React.ChangeEvent<unknown>,
                    newValue: number | number[]
                  ) => {
                    onChange(newValue);
                  }}
                  aria-labelledby="discrete-slider-small-steps"
                  valueLabelDisplay="auto"
                  step={0.1}
                  marks
                  min={0}
                  max={1}
                />
                {invalid && (
                  <FormHelperText>
                    {questionPrecisionError?.message}
                  </FormHelperText>
                )}
              </>
            )}
          />
        </div>
        <TextField
          value={defaultValues?.id || data?.saveBotConfig.id || ''}
          type="hidden"
          {...register('id', { valueAsNumber: true })}
        />
        <TextField
          value={defaultValues?.botId || data?.saveBotConfig.botId || ''}
          type="hidden"
          {...register('botId', { valueAsNumber: true })}
        />
        <TextField
          value={
            defaultValues?.knowledgeBaseId ||
            data?.saveBotConfig.knowledgeBaseId ||
            ''
          }
          type="hidden"
          {...register('knowledgeBaseId', { valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          id="noAnswerReply"
          label={t('Reply when no answer found')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QuestionAnswerIcon />
              </InputAdornment>
            ),
          }}
          error={errors.noAnswerReply && true}
          helperText={errors.noAnswerReply?.message}
          {...register('noAnswerReply', {
            maxLength: {
              value: 500,
              message: t(
                'Reply when no answer is found Must be no longer than 500 characters'
              ),
            },
          })}
        />
        <Divider className={classes.divider} />
        <Typography variant="subtitle1" gutterBottom>
          {t(
            'When there is a problem matching, but the accuracy is lower than the configuration, whether to display similar problems'
          )}
        </Typography>
        <Controller
          control={control}
          name="similarQuestionEnable"
          defaultValue
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={value}
                    onChange={onChange}
                    name="checkedB"
                    color="primary"
                  />
                }
                label={t('Show similar questions')}
              />
              {error && <FormHelperText>{error?.message}</FormHelperText>}
            </>
          )}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          label={t('Similar question tips')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QuestionAnswerIcon />
              </InputAdornment>
            ),
          }}
          error={errors.noAnswerReply && true}
          helperText={errors.noAnswerReply?.message}
          {...register('similarQuestionNotice', {
            maxLength: {
              value: 500,
              message: t(
                'Similar question tips length cannot be greater than 500 characters'
              ),
            },
          })}
        />
        <div className={classes.form}>
          <Typography variant="subtitle1" gutterBottom>
            {t('Similar questions count')}
          </Typography>
          <Controller
            control={control}
            name="similarQuestionCount"
            defaultValue={5}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <>
                <Slider
                  className={classes.form}
                  value={value}
                  onChange={(
                    _event: React.ChangeEvent<unknown>,
                    newValue: number | number[]
                  ) => {
                    onChange(newValue);
                  }}
                  aria-labelledby="discrete-slider-small-steps"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={10}
                />
                {invalid && <FormHelperText>{error?.message}</FormHelperText>}
              </>
            )}
          />
        </div>
        <Controller
          control={control}
          name="hotQuestionList"
          defaultValue={hotQuestionList}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              multiple
              disableCloseOnSelect
              id="tags-outlined"
              options={topicList}
              getOptionLabel={(option) => option.question}
              getOptionSelected={(option, selectValue) =>
                option.id === selectValue.id
              }
              value={value}
              onChange={(_event, newValue) => {
                onChange(newValue);
              }}
              renderOption={(option, { selected }) => (
                <>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.question}
                </>
              )}
              onInputChange={(_event, newInputValue) => {
                // 根据用户输入的字符串，搜索问题
                fetchTopic(
                  _.defaults(
                    { keyword: newInputValue },
                    variables?.topicFilterInput ?? topicFilterInput
                  )
                );
              }}
              loading={loadingTopic}
              className={classes.alert}
              noOptionsText={t('No matching questions')}
              // filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={t('Hot Questions')}
                  placeholder={t('Please select hot questions')}
                />
              )}
            />
          )}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
