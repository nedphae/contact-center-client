import React from 'react';
import _ from 'lodash';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import { ConversationQueryInput } from 'app/domain/graphql/Conversation';
import { FormControl, FormControlProps } from '@material-ui/core';
import ChipSelect, { SelectKeyValue } from '../Form/ChipSelect';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
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

interface FormProps {
  defaultValues: ConversationQueryInput;
  currentValues: ConversationQueryInput;
  selectKeyValueList: SelectKeyValue[];
  searchAction: (searchParams: ConversationQueryInput) => void;
}

const dateFnsUtils = new DateFnsUtils();

export default function SearchForm(props: FormProps) {
  const { defaultValues, currentValues, selectKeyValueList, searchAction } =
    props;
  const classes = useStyles();
  const { handleSubmit, register, reset, control, getValues, setValue } =
    useForm<ConversationQueryInput>({ defaultValues: currentValues });
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleDelete = (name: string, value: string) => {
    const values = getValues(name) as string[];
    setValue(
      name,
      _.remove(values, (v) => v !== value)
    );
  };

  const onSubmit: SubmitHandler<ConversationQueryInput> = (form) => {
    searchAction(form);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardActions disableSpacing>
            <div className={classes.root}>
              <TextField
                id="standard-basic"
                label="关键字"
                name="keyword"
                inputRef={register()}
              />
              <Controller
                control={control}
                name="timeRange.from"
                render={({ onChange, value }) => (
                  <KeyboardDateTimePicker
                    disableFuture
                    variant="inline"
                    format="yyyy-MM-dd HH:mm:ss"
                    margin="normal"
                    id="date-picker-inline"
                    label="开始时间"
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
                render={({ onChange, value }) => (
                  <KeyboardDateTimePicker
                    disableFuture
                    variant="inline"
                    format="yyyy-MM-dd HH:mm:ss"
                    margin="normal"
                    id="date-picker-inline"
                    label="结束时间"
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
              <ChipSelect
                selectKeyValueList={selectKeyValueList}
                control={control}
                handleDelete={handleDelete}
                CustomerFormControl={(formControlProps: FormControlProps) => (
                  <FormControl
                    className={classes.formControl}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...formControlProps}
                  />
                )}
              />
            </CardActions>
          </Collapse>
        </Card>
      </form>
    </MuiPickersUtilsProvider>
  );
}
