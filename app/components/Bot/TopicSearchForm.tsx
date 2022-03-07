/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import zhCN from 'date-fns/locale/zh-CN';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import { TopicFilterInput } from 'app/domain/graphql/Bot';

export const useSearchFormStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
        width: '26ch',
      },
    },
    chip: {
      margin: 2,
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    button: {
      margin: theme.spacing(1),
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: '50vw',
      maxWidth: '100%',
    },
  })
);

type FormType = TopicFilterInput;

interface FormProps {
  defaultValues: FormType;
  currentValues: FormType;
  searchAction: (searchParams: FormType) => void;
}

export default function TopicSearchFrom(props: FormProps) {
  const { defaultValues, currentValues, searchAction } = props;
  const classes = useSearchFormStyles();
  const { handleSubmit, register, reset } = useForm<FormType>({
    defaultValues: currentValues,
    shouldUnregister: true,
  });
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const onSubmit: SubmitHandler<FormType> = (form) => {
    // if (form.time) {
    //   searchAction(_.omit(form, 'time'));
    // } else {
    //   searchAction(_.omit(form, 'time', 'timeRange'));
    // }
    searchAction(form);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={zhCN}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        {/* 老式的折叠写法，新的参考 StaffShuntForm */}
        <Card>
          <CardActions disableSpacing>
            <div className={classes.root}>
              <TextField
                fullWidth
                id="standard-basic"
                label="关键字"
                {...register('keyword')}
              />
            </div>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              startIcon={<RotateLeftIcon />}
              aria-label="reset"
              onClick={() => {
                reset(defaultValues);
              }}
            >
              重置
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<SearchIcon />}
              aria-label="submit"
            >
              搜索
            </Button>
          </CardActions>
        </Card>
      </form>
    </MuiPickersUtilsProvider>
  );
}
