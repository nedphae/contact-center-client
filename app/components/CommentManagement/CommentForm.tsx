/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { useMutation } from '@apollo/client';
import { SubmitHandler, useForm } from 'react-hook-form';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';

import { Link, Typography } from '@material-ui/core';
import { CommentPojo } from 'app/domain/Comment';
import {
  MUTATION_COMMENT,
  SaveCommentGraphql,
} from 'app/domain/graphql/Comment';
import javaInstant2DateStr from 'app/utils/timeUtils';
import useAlert from 'app/hook/alert/useAlert';

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

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveComment, { loading }] = useMutation<SaveCommentGraphql>(
    MUTATION_COMMENT,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }
  const { register, handleSubmit } = useForm<CommentPojo>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<CommentPojo> = async (form) => {
    // 用户信息表单
    saveComment({ variables: { commentList: [form] } });
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
          创建时间：
          {defaultValues && javaInstant2DateStr(defaultValues.createdAt)}
        </Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="uid"
          label="用户标识"
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
          label="用户姓名"
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
          label="手机"
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
          label="邮箱"
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
          label="留言内容"
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
          来源页：
          {defaultValues?.fromPage && (
            <Link href={defaultValues?.fromPage}>
              {defaultValues?.fromPage}
            </Link>
          )}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          来源IP：{defaultValues?.fromIp}
        </Typography>
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
