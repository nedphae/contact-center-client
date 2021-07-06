import _ from 'lodash';
import React from 'react';

import {
  makeStyles,
  Theme,
  createStyles,
  Chip,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
} from '@material-ui/core';
import { Control, Controller } from 'react-hook-form';

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
  })
);

function getStyles(name: string, keys: string[], theme: Theme) {
  return {
    fontWeight:
      keys.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

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

export interface SelectKeyValue {
  label: string;
  name: string;
  // id to name
  selectList: Record<string, string>;
  defaultValue: string[] | string;
}

export interface SelectProps {
  selectKeyValueList: SelectKeyValue[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<Record<string, any>>;
  handleDelete: (name: string, value: string) => void;
}

export default function ChipSelect(props: SelectProps) {
  const { selectKeyValueList, control, handleDelete } = props;
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div className={classes.root}>
      {selectKeyValueList.map((it) => (
        <FormControl key={it.name} className={classes.formControl}>
          <InputLabel id="demo-mutiple-chip-label">{it.label}</InputLabel>
          <Controller
            control={control}
            name={it.name}
            defaultValue={it.defaultValue}
            // rules={{
            //   setValueAs: (val) =>
            //     val.map((v: string) => parseInt(v, 10)),
            // }}
            render={({ onChange, value }) => (
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
                    style={getStyles(id, _.keys(it.selectList), theme)}
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
  );
}
