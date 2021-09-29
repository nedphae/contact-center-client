import React from 'react';

import _ from 'lodash';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Box } from '@material-ui/core';

import { Properties, RootProperties } from 'app/domain/Properties';
import SubmitButton from 'app/components/Form/SubmitButton';
import useAlert from 'app/hook/alert/useAlert';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      margin: theme.spacing(0, 5, 0),
    },
  })
);

interface FormProps {
  defaultValues: RootProperties;
  properties4Set: string;
}

interface Graphql {
  updateProperties: Properties;
}

const MUTATION_PROPERTIES = gql`
  mutation Properties($properties: [PropertiesInput!]!) {
    updateProperties(properties: $properties) {
      id
      organizationId
      key
      value
      label
      available
      personal
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

  const { onLoadding, onCompleted, onError } = useAlert();
  const [updateProperties, { loading }] = useMutation<Graphql>(
    MUTATION_PROPERTIES,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<FormResult> = (form) => {
    updateProperties({ variables: { properties: form.props } });
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
                    multiline
                    label={childProp.label}
                    defaultValue={childProp.value}
                    id={`${properties4Set}.${fk}.value`}
                    name={`props[${index}].value`}
                    inputRef={register()}
                  />
                </Box>
              );
            })}
        <SubmitButton />
      </form>
    </div>
  );
}
