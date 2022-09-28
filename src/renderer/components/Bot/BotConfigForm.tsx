/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useTranslation } from 'react-i18next';

import _ from 'lodash';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
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

import { BotConfig, Topic } from 'renderer/domain/Bot';
import useAlert from 'renderer/hook/alert/useAlert';
import {
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Switch,
  Typography,
} from '@material-ui/core';
import SubmitButton from '../Form/SubmitButton';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const useStyles = makeStyles(() =>
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
  }),
);

function getStyles(name: string, keys: string[], theme: Theme) {
  return {
    fontWeight:
      keys.indexOf(name) === -1
        ? theme.typography.fontWeightLight
        : theme.typography.fontWeightBold,
  };
}

interface FormProps {
  defaultValues: BotConfig;
  afterMutationCallback: () => void | undefined;
  allTopic: Topic[] | undefined;
}

interface Graphql {
  saveBotConfig: BotConfig;
}

export const MUTATION_BOT_CONFIG = gql`
  mutation BotConfig($botConfigInput: BotConfigInput!) {
    saveBotConfig(botConfig: $botConfigInput) {
      id
      botId
      knowledgeBaseId
      noAnswerReply
      questionPrecision
      similarQuestionEnable
      similarQuestionNotice
      similarQuestionCount
      hotQuestion
    }
  }
`;

export default function BotConfigForm(props: FormProps) {
  const { defaultValues, afterMutationCallback, allTopic } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BotConfig>({
    defaultValues,
    shouldUnregister: true,
  });

  const filterTopic = allTopic?.filter(
    (it) => it.knowledgeBaseId === defaultValues.knowledgeBaseId,
  );

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveBotConfig, { loading, data }] = useMutation<Graphql>(
    MUTATION_BOT_CONFIG,
    {
      onCompleted,
      onError,
    },
  );
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<BotConfig> = async (form) => {
    await saveBotConfig({
      variables: { botConfigInput: _.omit(form, '__typename') },
    });
    afterMutationCallback();
  };

  const hotQuesion = watch('hotQuestion')?.split(',');

  function handleHotQuestionChange(
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
  ) {
    const hotQuesiontIds = event.target.value as string[];
    const tempHotQuestion = hotQuesiontIds.join(',');
    setValue('hotQuestion', tempHotQuestion);
  }

  function handleHotQuestionDelete(connectId: string) {
    const tempIds = hotQuesion?.filter((it) => it !== connectId);
    if (tempIds && tempIds.length > 0) {
      const tempHotQuestion = hotQuesion
        ?.filter((it) => it !== connectId)
        .join(',');
      setValue('hotQuestion', tempHotQuestion);
    } else {
      setValue('hotQuestion', undefined);
    }
  }

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
                    newValue: number | number[],
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
          render={({
            field: { onChange, value },
            fieldState: { invalid, error },
          }) => (
            <>
              <FormControlLabel
                control={(
                  <Switch
                    checked={value}
                    onChange={onChange}
                    name="checkedB"
                    color="primary"
                  />
                )}
                label={t('Show similar questions')}
              />
              {invalid && <FormHelperText>{error?.message}</FormHelperText>}
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
                    newValue: number | number[],
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
        <FormControl variant="outlined" margin="normal" fullWidth>
          <InputLabel id="demo-mutiple-chip-label">
            {t('Top Questions')}
          </InputLabel>
          <Select
            labelId="demo-mutiple-chip-label"
            id="demo-mutiple-chip"
            multiple
            input={<Input id="select-multiple-chip" />}
            onChange={handleHotQuestionChange}
            value={hotQuesion ?? []}
            label={t('Top Questions')}
            renderValue={(selected) => (
              <div className={classes.chips}>
                {(selected as string[]).map((id) => (
                  <Chip
                    key={id}
                    label={
                      filterTopic
                        ?.filter((topic) => topic.id === id)
                        ?.map((topic) => topic.question)[0] ?? ''
                    }
                    className={classes.chip}
                    onDelete={() => {
                      handleHotQuestionDelete(id);
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                  />
                ))}
              </div>
            )}
            MenuProps={MenuProps}
          >
            {filterTopic &&
              filterTopic.map((topic) => (
                <MenuItem
                  key={topic.id}
                  value={topic.id}
                  style={getStyles(topic.id ?? '', hotQuesion ?? [], theme)}
                >
                  {topic.question}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <SubmitButton />
      </form>
    </div>
  );
}
