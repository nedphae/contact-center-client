/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from 'react-i18next';

import _ from 'lodash';
import { useMutation } from '@apollo/client';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';

import {
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { CommentPojo, CommentSolved } from 'renderer/domain/Comment';
import {
  MUTATION_COMMENT,
  MUTATION_COMMENT_WITH_IM_SMS,
  SaveCommentGraphql,
  SaveCommentWithIMAndSMSGraphql,
} from 'renderer/domain/graphql/Comment';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import useAlert from 'renderer/hook/alert/useAlert';

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

interface CommentFormProps {
  defaultValues: CommentPojo | undefined;
}
export default function CommentForm(props: CommentFormProps) {
  const { defaultValues } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const { t: optionT } = useTranslation();

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveComment, { loading }] = useMutation<SaveCommentGraphql>(
    MUTATION_COMMENT,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(t('Saving'));
  }

  const [saveCommentWithIMAndSMS, { loading: smsLoading }] =
    useMutation<SaveCommentWithIMAndSMSGraphql>(MUTATION_COMMENT_WITH_IM_SMS, {
      onCompleted,
      onError,
    });
  if (smsLoading) {
    onLoadding(t('Saving'));
  }

  const { register, handleSubmit, control, watch } = useForm<CommentPojo>({
    defaultValues,
    shouldUnregister: true,
  });
  const selectedSolvedWay = watch('selectedSolvedWay');

  const onSubmit: SubmitHandler<CommentPojo> = async (form) => {
    if (form.selectedSolvedWay === 1) {
      saveCommentWithIMAndSMS({
        variables: { commentList: [_.omit(form, 'selectedSolvedWay')] },
      });
    } else {
      // 用户留言表单
      saveComment({
        variables: { commentList: [_.omit(form, 'selectedSolvedWay')] },
      });
    }
  };

  return (
    <div className={classes.paper}>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.organizationId || ''}
          type="hidden"
          {...register('organizationId', { valueAsNumber: true })}
        />
        <TextField
          value={defaultValues?.shuntId || ''}
          type="hidden"
          {...register('shuntId', { valueAsNumber: true })}
        />
        <TextField
          value={defaultValues?.userId || ''}
          type="hidden"
          {...register('userId', { valueAsNumber: true })}
        />
        <TextField
          value={defaultValues?.createdAt || ''}
          type="hidden"
          {...register('createdAt', { valueAsNumber: true })}
        />
        <Typography variant="h6" gutterBottom>
          {`${t('Created Date')}: `}
          {defaultValues && javaInstant2DateStr(defaultValues.createdAt)}
        </Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="uid"
          label={t('UID')}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          {...register('uid')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          label={t('Name')}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          {...register('name')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="mobile"
          label={t('Mobile')}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          {...register('mobile')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="email"
          label={t('Email')}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          {...register('email')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          id="message"
          label={t('Message')}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          {...register('message')}
        />
        <Typography variant="subtitle1" gutterBottom>
          {`${t('From Page')}: `}
          {defaultValues?.fromPage && (
            <Link href={defaultValues?.fromPage}>
              {defaultValues?.fromPage}
            </Link>
          )}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {`${t('IP')}: `}
          {defaultValues?.fromIp}
        </Typography>
        {CommentSolved.UNSOLVED === defaultValues?.solved && (
          <Controller
            control={control}
            name="selectedSolvedWay"
            defaultValue={0}
            render={({ field: { onChange, value } }) => (
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel id="demo-mutiple-chip-label">
                  {t('Choose a solution')}
                </InputLabel>
                <Select
                  labelId="solved"
                  id="solved"
                  onChange={(event) => {
                    const tempId = event.target.value as string;
                    onChange(tempId === '' ? undefined : +tempId);
                  }}
                  value={value === undefined ? '' : +value}
                  label={t('Choose a solution')}
                >
                  <MenuItem value={0}>{t('Manual tagging')}</MenuItem>
                  <MenuItem value={1}>{t('SMS')}</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        )}
        {selectedSolvedWay === 1 && (
          <>
            {/* 通过短信处理留言 */}
            <Typography variant="subtitle1" gutterBottom>
              {t('Handling messages via SMS')}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              (
              {t(
                'Due to policy restrictions, the system will send the content of the message to the user through the chat message, and send a SMS notify the user to click the link to view'
              )}
              )
            </Typography>
          </>
        )}
        {selectedSolvedWay !== 1 && (
          <>
            <Controller
              control={control}
              name="solved"
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <FormControl variant="outlined" margin="normal" fullWidth>
                  <InputLabel id="demo-mutiple-chip-label">
                    {t('Solved Status')}
                  </InputLabel>
                  <Select
                    labelId="solved"
                    id="solved"
                    onChange={(event) => {
                      const tempId = event.target.value as string;
                      onChange(tempId === '' ? undefined : +tempId);
                    }}
                    value={value === undefined ? '' : +value}
                    label={t('Solved Status')}
                  >
                    <MenuItem value={0}>{t('Unsolved')}</MenuItem>
                    <MenuItem value={1}>{t('Solved')}</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="solvedWay"
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <FormControl variant="outlined" margin="normal" fullWidth>
                  <InputLabel id="demo-mutiple-chip-label">
                    {t('Solution')}
                  </InputLabel>
                  <Select
                    labelId="solvedWay"
                    id="solvedWay"
                    onChange={(event) => {
                      const tempId = event.target.value as string;
                      onChange(tempId === '' ? undefined : +tempId);
                    }}
                    value={value === undefined ? '' : +value}
                    label={t('Solution')}
                  >
                    <MenuItem value={0}>{t('Mobile')}</MenuItem>
                    <MenuItem value={1}>{t('Email')}</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </>
        )}
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          id="solvedMsg"
          label={t('Solution content')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          {...register('solvedMsg')}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
        >
          {optionT('Save')}
        </Button>
      </form>
    </div>
  );
}
