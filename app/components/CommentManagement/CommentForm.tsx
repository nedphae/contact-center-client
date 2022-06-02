/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

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
import { CommentPojo, CommentSolved } from 'app/domain/Comment';
import {
  MUTATION_COMMENT,
  MUTATION_COMMENT_WITH_IM_SMS,
  SaveCommentGraphql,
  SaveCommentWithIMAndSMSGraphql,
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

  const [saveCommentWithIMAndSMS, { loading: smsLoading }] =
    useMutation<SaveCommentWithIMAndSMSGraphql>(MUTATION_COMMENT_WITH_IM_SMS, {
      onCompleted,
      onError,
    });
  if (smsLoading) {
    onLoadding(loading);
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
        {CommentSolved.UNSOLVED === defaultValues?.solved && (
          <Controller
            control={control}
            name="selectedSolvedWay"
            defaultValue={0}
            render={({ field: { onChange, value } }) => (
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel id="demo-mutiple-chip-label">
                  选择解决方式
                </InputLabel>
                <Select
                  labelId="solved"
                  id="solved"
                  onChange={(event) => {
                    const tempId = event.target.value as string;
                    onChange(tempId === '' ? undefined : +tempId);
                  }}
                  value={value === undefined ? '' : +value}
                  label="选择解决方式"
                >
                  <MenuItem value={0}>手动标记</MenuItem>
                  <MenuItem value={1}>短信通知</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        )}
        {selectedSolvedWay === 1 && (
          <>
            {/* 通过短信处理留言 */}
            <Typography variant="subtitle1" gutterBottom>
              通过短信处理留言
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              (因政策限制，系统将把留言处理内容通过聊天消息发送给用户，并发送短信通知用户点击链接查看)
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
                  <InputLabel id="demo-mutiple-chip-label">解决状态</InputLabel>
                  <Select
                    labelId="solved"
                    id="solved"
                    onChange={(event) => {
                      const tempId = event.target.value as string;
                      onChange(tempId === '' ? undefined : +tempId);
                    }}
                    value={value === undefined ? '' : +value}
                    label="解决状态"
                  >
                    <MenuItem value={0}>未解决</MenuItem>
                    <MenuItem value={1}>已解决</MenuItem>
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
                  <InputLabel id="demo-mutiple-chip-label">解决方式</InputLabel>
                  <Select
                    labelId="solvedWay"
                    id="solvedWay"
                    onChange={(event) => {
                      const tempId = event.target.value as string;
                      onChange(tempId === '' ? undefined : +tempId);
                    }}
                    value={value === undefined ? '' : +value}
                    label="解决方式"
                  >
                    <MenuItem value={0}>手机</MenuItem>
                    <MenuItem value={1}>邮件</MenuItem>
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
          label="处理内容"
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
          保存
        </Button>
      </form>
    </div>
  );
}
