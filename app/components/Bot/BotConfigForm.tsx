import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

import { CircularProgress, Typography } from '@material-ui/core';

import { BotConfig } from 'app/domain/Bot';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  })
);

interface FormProps {
  defaultValues: BotConfig;
}

interface Graphql {
  saveBotConfig: BotConfig;
}

const MUTATION = gql`
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
  const { defaultValues } = props;
  const classes = useStyles();
  const { handleSubmit, register, errors } = useForm<BotConfig>({
    defaultValues,
  });

  const [saveBotConfig, { loading, data }] = useMutation<Graphql>(MUTATION);

  const onSubmit: SubmitHandler<BotConfig> = (form) => {
    saveBotConfig({ variables: { botConfigInput: form } });
  };

  return (
    <div className={classes.paper}>
      {loading && <CircularProgress />}
      {data && <Typography>Success!</Typography>}
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveBotConfig.id || ''}
          name="id"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <TextField
          value={defaultValues?.botId || data?.saveBotConfig.botId || ''}
          name="botId"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <TextField
          value={
            defaultValues?.knowledgeBaseId ||
            data?.saveBotConfig.knowledgeBaseId ||
            ''
          }
          name="knowledgeBaseId"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="noAnswerReply"
          name="noAnswerReply"
          label="没有找到答案时的回复"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QuestionAnswerIcon />
              </InputAdornment>
            ),
          }}
          error={errors.noAnswerReply && true}
          helperText={errors.noAnswerReply}
          inputRef={register({
            maxLength: {
              value: 500,
              message: '没有找到答案时的回复 长度不能大于500个字符',
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
