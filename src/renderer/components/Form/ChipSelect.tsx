import _ from 'lodash';
import React from 'react';

import {
  makeStyles,
  Theme,
  createStyles,
  Chip,
  Input,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
  FormControlProps,
} from '@material-ui/core';

import { Control, Controller } from 'react-hook-form';

const useStyles = makeStyles(() =>
  createStyles({
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
        ? theme.typography.fontWeightLight
        : theme.typography.fontWeightBold,
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
  defaultValue: string[];
}

export interface SelectProps {
  selectKeyValueList: SelectKeyValue[];
  CustomerFormControl: (porps: FormControlProps) => JSX.Element;
  control: Control<Record<string, unknown>>;
  handleDelete: (name: string, value: string) => void;
}

export default function ChipSelect(props: SelectProps) {
  const { selectKeyValueList, control, handleDelete, CustomerFormControl } =
    props;
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div>
      {selectKeyValueList.map((it) => (
        <Controller
          key={it.name}
          control={control}
          name={it.name}
          defaultValue={it.defaultValue}
          // rules={{
          //   setValueAs: (val) =>
          //     val.map((v: string) => parseInt(v, 10)),
          // }}
          render={({ field: { onChange, value } }) => (
            <CustomerFormControl>
              <InputLabel id="demo-mutiple-chip-label">{it.label}</InputLabel>
              <Select
                labelId="demo-mutiple-chip-label"
                id="demo-mutiple-chip"
                multiple
                input={<Input id="select-multiple-chip" />}
                onChange={onChange}
                value={value ?? []}
                label={it.label}
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
                    style={getStyles(id, (value as string[]) ?? [], theme)}
                  >
                    {it.selectList[id]}
                  </MenuItem>
                ))}
              </Select>
            </CustomerFormControl>
          )}
        />
      ))}
    </div>
  );
}
