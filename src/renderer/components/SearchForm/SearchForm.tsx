/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler, Controller, Control } from 'react-hook-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import zhCN from 'date-fns/locale/zh-CN';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import { ConversationFilterInput } from 'renderer/domain/graphql/Conversation';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlProps,
  Grid,
} from '@material-ui/core';
import { CustomerQueryInput } from 'renderer/domain/graphql/Customer';
import ChipSelect, { SelectKeyValue } from '../Form/ChipSelect';

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

type FormType = ConversationFilterInput | CustomerQueryInput;

interface FormProps {
  defaultValues: FormType;
  currentValues: FormType;
  selectKeyValueList: SelectKeyValue[];
  searchAction: (searchParams: FormType) => void;
  customerForm?: (control: Control<FormType>) => React.ReactNode;
}

const dateFnsUtils = new DateFnsUtils();

export default function SearchForm(props: FormProps) {
  const {
    defaultValues,
    currentValues,
    selectKeyValueList,
    searchAction,
    customerForm,
  } = props;
  const classes = useSearchFormStyles();
  const { t } = useTranslation();

  const { handleSubmit, register, reset, control, getValues, setValue } =
    useForm<FormType>({
      defaultValues: currentValues,
      shouldUnregister: true,
    });
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleDelete = (name: keyof FormType, value: string) => {
    const values = getValues(name) as string[];
    setValue(name, _.remove(values, (v) => v !== value) as any);
  };

  const onSubmit: SubmitHandler<FormType> = (form) => {
    if (form.time) {
      searchAction(_.omit(form, 'time'));
    } else {
      searchAction(_.omit(form, 'time', 'timeRange'));
    }
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={zhCN}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        {/* 老式的折叠写法，新的参考 StaffShuntForm */}
        <Card>
          <CardActions disableSpacing>
            <div className={classes.root}>
              <TextField
                id="standard-basic"
                label={t('Keyword')}
                {...register('keyword')}
              />
              <Controller
                control={control}
                defaultValue
                name="time"
                render={({ field: { onChange, value } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
                    }
                    label={t('Time Range')}
                  />
                )}
              />
              <Controller
                control={control}
                name="timeRange.from"
                render={({ field: { onChange, value } }) => (
                  <KeyboardDateTimePicker
                    disableFuture
                    variant="inline"
                    format="yyyy-MM-dd HH:mm:ss"
                    margin="normal"
                    id="date-picker-inline"
                    label={t('Start time')}
                    value={value}
                    onChange={(d) => {
                      if (d) {
                        onChange(
                          dateFnsUtils.format(d, "yyyy-MM-dd'T'HH:mm:ss.SSSXX")
                        );
                      }
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="timeRange.to"
                render={({ field: { onChange, value } }) => (
                  <KeyboardDateTimePicker
                    variant="inline"
                    format="yyyy-MM-dd HH:mm:ss"
                    margin="normal"
                    id="date-picker-inline"
                    label={t('End Time')}
                    value={value}
                    onChange={(d) => {
                      if (d) {
                        onChange(
                          dateFnsUtils.format(d, "yyyy-MM-dd'T'HH:mm:ss.SSSXX")
                        );
                      }
                    }}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                )}
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
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </IconButton>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardActions>
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  {customerForm && customerForm(control)}
                </Grid>
                <Grid item xs={12}>
                  <ChipSelect
                    selectKeyValueList={selectKeyValueList}
                    control={
                      control as unknown as Control<
                        Record<string, unknown>,
                        unknown
                      >
                    }
                    handleDelete={
                      handleDelete as (name: string, value: string) => void
                    }
                    CustomerFormControl={(
                      formControlProps: FormControlProps
                    ) => (
                      <FormControl
                        className={classes.formControl}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...formControlProps}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardActions>
          </Collapse>
        </Card>
      </form>
    </MuiPickersUtilsProvider>
  );
}
SearchForm.defaultProps = {
  customerForm: undefined,
};
