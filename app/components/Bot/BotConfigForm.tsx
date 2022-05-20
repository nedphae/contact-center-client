/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import _ from 'lodash';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

import { BotConfig } from 'app/domain/Bot';
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
    form: {
      width: '100%',
    },
  })
);

interface FormProps {
  defaultValues: BotConfig;
  afterMutationCallback: () => void | undefined;
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
    }
  }
`;

export default function BotConfigForm(props: FormProps) {
  const { defaultValues, afterMutationCallback } = props;
  const classes = useStyles();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<BotConfig>({
    defaultValues,
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveBotConfig, { loading, data }] = useMutation<Graphql>(
    MUTATION_BOT_CONFIG,
    {
      onCompleted,
      onError,
    }
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

  return (
    <div className={classes.paper}>
      <form
        className={classes.form}
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
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
          label="没有找到答案时的回复"
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
              message: '没有找到答案时的回复 长度不能大于500个字符',
            },
          })}
        />
        <SubmitButton />
      </form>
    </div>
  );
}
