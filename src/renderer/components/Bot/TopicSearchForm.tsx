/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from 'react-i18next';
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
import { TopicFilterInput } from 'renderer/domain/graphql/Bot';

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
  currentValues: FormType | undefined;
  searchAction: (searchParams: FormType) => void;
}

export default function TopicSearchFrom(props: FormProps) {
  const { defaultValues, currentValues, searchAction } = props;
  const { t } = useTranslation();

  const classes = useSearchFormStyles();
  const { handleSubmit, register, reset } = useForm<FormType>({
    defaultValues: currentValues ?? defaultValues,
    shouldUnregister: true,
  });

  const onSubmit: SubmitHandler<FormType> = (form) => {
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
                label={t('Keyword')}
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
              {t('Reset')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<SearchIcon />}
              aria-label="submit"
            >
              {t('Search')}
            </Button>
          </CardActions>
        </Card>
      </form>
    </MuiPickersUtilsProvider>
  );
}
