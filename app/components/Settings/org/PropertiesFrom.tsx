import React from 'react';

import _ from 'lodash';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Box } from '@material-ui/core';

import Staff from 'app/domain/StaffInfo';
import { Properties, RootProperties } from 'app/domain/Properties';

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

interface FormProps {
  defaultValues: RootProperties;
  properties4Set: string;
}

interface Graphql {
  saveStaff: Staff;
}

const MUTATION_STAFF = gql`
  mutation Staff($staffInput: StaffInput!) {
    saveStaff(staff: $staffInput) {
      id
      organizationId
      username
      role
      staffGroupId
      realName
      nickName
      avatar
      simultaneousService
      maxTicketPerDay
      maxTicketAllTime
      staffType
      gender
      mobilePhone
      personalizedSignature
      enabled
    }
  }
`;

type FormResult = {
  props: {
    id: number;
    value: string;
  }[];
};

export default function PropertiesFrom(props: FormProps) {
  const { defaultValues, properties4Set } = props;
  const properties = _.at(defaultValues, properties4Set)[0];
  const classes = useStyles();

  const { handleSubmit, register } = useForm<FormResult>();
  const [saveStaff] = useMutation<Graphql>(MUTATION_STAFF);

  const onSubmit: SubmitHandler<FormResult> = (form) => {
    console.info(form);
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        {properties &&
          _.keys(properties)
            .filter((pk) => !['id', 'label', 'available', 'value'].includes(pk))
            .map((fk, index) => {
              const childProp = properties[fk] as Properties;
              return (
                <Box key={`${properties4Set}.${fk}`}>
                  <TextField
                    value={childProp.id}
                    name={`props[${index}].id`}
                    type="hidden"
                    inputRef={register({ valueAsNumber: true })}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label={childProp.label}
                    value={childProp.value}
                    id={`${properties4Set}.${fk}.value`}
                    name={`props[${index}].value`}
                    inputRef={register()}
                  />
                </Box>
              );
            })}
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
