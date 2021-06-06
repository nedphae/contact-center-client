import React from 'react';
import _ from 'lodash';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: '50vw',
      maxWidth: '100%',
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
  })
);
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, keys: string[], theme: Theme) {
  return {
    fontWeight:
      keys.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export interface SelectKeyValue {
  label: string;
  name: string;
  // id to name
  selectList: Record<string, string>;
  defaultValue: string[];
}

interface FormProps {
  defaultValues: ConversationQueryInput;
  currentValues: ConversationQueryInput;
  selectKeyValueList: SelectKeyValue[];
  searchAction: (searchParams: ConversationQueryInput) => void;
}

export default function SearchForm(props: FormProps) {
  const {
    defaultValues,
    currentValues,
    selectKeyValueList,
    searchAction,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const {
    handleSubmit,
    register,
    reset,
    control,
    getValues,
    setValue,
  } = useForm<ConversationQueryInput>({ defaultValues: currentValues });
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
                inputRef={register({ maxLength: 50 })}
              />
              <Controller
                control={control}
                name="timeRange.from"
                render={(
                  { onChange, onBlur, value, name, ref },
                  { invalid, isTouched, isDirty }
                ) => (
                  <KeyboardDateTimePicker
                    disableToolbar
                    variant="inline"
                    format="yyyy-MM-dd HH:mm:ss"
                    margin="normal"
                    id="date-picker-inline"
                    label="开始时间"
                    value={value}
                    onChange={(d) => onChange(d)}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="timeRange.to"
                render={(
                  { onChange, onBlur, value, name, ref },
                  { invalid, isTouched, isDirty }
                ) => (
                  <KeyboardDateTimePicker
                    disableToolbar
                    variant="inline"
                    format="yyyy-MM-dd HH:mm:ss"
                    margin="normal"
                    id="date-picker-inline"
                    label="结束时间"
                    value={value}
                    onChange={onChange}
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
              <div className={classes.root}>
                {selectKeyValueList.map((it) => (
                  <FormControl key={it.name} className={classes.formControl}>
                    <InputLabel id="demo-mutiple-chip-label">
                      {it.label}
                    </InputLabel>
                    <Controller
                      control={control}
                      name={it.name}
                      defaultValue={it.defaultValue}
                      // rules={{
                      //   setValueAs: (val) =>
                      //     val.map((v: string) => parseInt(v, 10)),
                      // }}
                      render={(
                        { onChange, onBlur, value, ref },
                        { invalid, isTouched, isDirty }
                      ) => (
                        <Select
                          labelId="demo-mutiple-chip-label"
                          id="demo-mutiple-chip"
                          multiple
                          input={<Input id="select-multiple-chip" />}
                          onChange={onChange}
                          value={value}
                          renderValue={(selected) => (
                            <div className={classes.chips}>
                              {(selected as string[]).map((id) => (
                                <Chip
                                  key={id}
                                  label={it.selectList[id]}
                                  className={classes.chip}
                                  onDelete={() => {
                                    handleDelete(it.name, id);
                                  }}
                                  onMouseDown={(event) => {
                                    event.stopPropagation();
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          MenuProps={MenuProps}
                        >
                          {_.keys(it.selectList).map((id) => (
                            <MenuItem
                              key={id}
                              value={id}
                              style={getStyles(
                                id,
                                _.keys(it.selectList),
                                theme
                              )}
                            >
                              {it.selectList[id]}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                ))}
              </div>
            </CardActions>
          </Collapse>
        </Card>
      </form>
    </MuiPickersUtilsProvider>
  );
}
