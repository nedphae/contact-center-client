/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';

import { useMutation } from '@apollo/client';
import useAlert from 'renderer/hook/alert/useAlert';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import { Properties } from 'renderer/domain/Properties';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import { MUTATION_PROPERTIES, PropertiesUpdateGraphql } from './PropertiesFrom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      padding: theme.spacing(2),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
  })
);

interface CommentAndEvaluateConfigType {
  comment: {
    title?: string;
    nameText?: string;
    mobileText?: string;
    emailText?: string;
    messageText?: string;
    placeholder?: string;
    cancleBtnText?: string;
    submitBtnText?: string;
    successMsg?: string;
    failMsg?: string;
  };
  evaluate: {
    title?: string;
    evaluationOptionsText?: string;
    evaluationOptions: {
      eval_100?: string;
      eval_75?: string;
      eval_50?: string;
      eval_25?: string;
      eval_1?: string;
    };
    userResolvedOptions: {
      status_1?: string;
      status_2?: string;
    };
    evaluationRemarkText?: string;
    userResolvedStatusText?: string;
    placeholder?: string;
    cancleBtnText?: string;
    submitBtnText?: string;
    thanks?: string;
  };
}

export interface CommentAndEvaluateConfigProp {
  props?: Properties;
  refetch: () => void;
}

const defaultCommentJsonText =
  '{"title":"留言","nameText":"姓名","mobileText":"手机","emailText":"邮箱","messageText":"留言","placeholder":"请输入...","cancleBtnText":"取消","submitBtnText":"提交","successMsg":"留言提交成功","failMsg":"姓名 留言 不能为空, 手机/邮箱 请至少填写一项"}';
const defaultEvaluateJsonText =
  '{"title":"评价","evaluationOptionsText":"满意度","evaluationOptions":{"eval_100":"非常满意","eval_75":"满意","eval_50":"一般","eval_25":"不满意","eval_1":"非常不满意"},"userResolvedOptions":{"status_1":"已解决","status_2":"未解决"},"evaluationRemarkText":"评价内容","userResolvedStatusText":"解决状态","placeholder":"请输入...","cancleBtnText":"取消","submitBtnText":"提交","thanks":"谢谢您的评价"}';

const defaultValues = {
  comment: JSON.parse(defaultCommentJsonText),
  evaluate: JSON.parse(defaultEvaluateJsonText),
};

export default function CommentAndEvaluateConfig(
  prop: CommentAndEvaluateConfigProp
) {
  const { props, refetch } = prop;
  const { t } = useTranslation();
  const { t: optionT } = useTranslation();

  const configJson = (props as unknown as { configJson: Properties })
    ?.configJson;
  const classes = useStyles();

  const caeCommentJsonText =
    (configJson?.comment as unknown as Properties)?.value ??
    defaultCommentJsonText;
  const caeEvaluateJsonText =
    (configJson?.evaluate as unknown as Properties)?.value ??
    defaultEvaluateJsonText;

  const caeJson = {
    comment: JSON.parse(caeCommentJsonText),
    evaluate: JSON.parse(caeEvaluateJsonText),
  };

  const { handleSubmit, register, reset } =
    useForm<CommentAndEvaluateConfigType>({
      defaultValues: caeJson,
      shouldUnregister: true,
    });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [updateProperties, { loading }] = useMutation<PropertiesUpdateGraphql>(
    MUTATION_PROPERTIES,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding('Saving');
  }

  const onSubmit: SubmitHandler<CommentAndEvaluateConfigType> = async (
    form
  ) => {
    await updateProperties({
      variables: {
        properties: [
          _.defaults(
            {
              value: JSON.stringify(form.comment),
              key: 'cae.configJson.comment',
              label: '留言配置',
            },
            configJson?.comment ?? {}
          ),
          _.defaults(
            {
              value: JSON.stringify(form.evaluate),
              key: 'cae.configJson.evaluate',
              label: '评价配置',
            },
            configJson?.evaluate ?? {}
          ),
        ],
      },
    });
    refetch();
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          <Grid item sm={6} xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              {t('Message display text configuration')}
            </Typography>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Title')}
              {...register('comment.title')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Name')}
              {...register('comment.nameText')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Mobile')}
              {...register('comment.mobileText')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Email')}
              {...register('comment.emailText')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Message content')}
              {...register('comment.messageText')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Please enter')}
              {...register('comment.placeholder')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Cancel')}
              {...register('comment.cancleBtnText')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Submit')}
              {...register('comment.submitBtnText')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Message submitted successfully')}
              {...register('comment.successMsg')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Message content is empty')}
              {...register('comment.failMsg')}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              {t('Rate display text configuration')}
            </Typography>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Title')}
              {...register('evaluate.title')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Satisfaction')}
              {...register('evaluate.evaluationOptionsText')}
            />
            <Paper variant="outlined" square className={classes.paper}>
              <Grid container spacing={4}>
                <Grid item sm={4} xs={8}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label={t('Very satisfied')}
                    {...register('evaluate.evaluationOptions.eval_100')}
                  />
                </Grid>
                <Grid item sm={4} xs={8}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label={t('Satisfied')}
                    {...register('evaluate.evaluationOptions.eval_75')}
                  />
                </Grid>
                <Grid item sm={4} xs={8}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label={t('Neutral')}
                    {...register('evaluate.evaluationOptions.eval_50')}
                  />
                </Grid>
                <Grid item sm={4} xs={8}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label={t('Unsatisfied')}
                    {...register('evaluate.evaluationOptions.eval_25')}
                  />
                </Grid>
                <Grid item sm={4} xs={8}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label={t('Very Unsatisfied')}
                    {...register('evaluate.evaluationOptions.eval_1')}
                  />
                </Grid>
              </Grid>
            </Paper>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Rate content')}
              {...register('evaluate.evaluationRemarkText')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Solved Status')}
              {...register('evaluate.userResolvedStatusText')}
            />
            <Paper variant="outlined" square className={classes.paper}>
              <Grid container spacing={4}>
                <Grid item sm={4} xs={8}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label={t('Solved')}
                    {...register('evaluate.userResolvedOptions.status_1')}
                  />
                </Grid>
                <Grid item sm={4} xs={8}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label={t('Unsolved')}
                    {...register('evaluate.userResolvedOptions.status_2')}
                  />
                </Grid>
              </Grid>
            </Paper>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Please enter')}
              {...register('evaluate.placeholder')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Cancel')}
              {...register('evaluate.cancleBtnText')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Submit')}
              {...register('evaluate.submitBtnText')}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label={t('Thanks for your rate')}
              {...register('evaluate.thanks')}
            />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item sm={6} xs={12}>
            <div className={classes.wrapper}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<RotateLeftIcon />}
                fullWidth
                aria-label="reset"
                onClick={() => {
                  reset(defaultValues);
                }}
              >
                {optionT('Reset')}
              </Button>
            </div>
          </Grid>
          <Grid item sm={6} xs={12}>
            <SubmitButton />
          </Grid>
        </Grid>
      </form>
    </div>
  );
}
