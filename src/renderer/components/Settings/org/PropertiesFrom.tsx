/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useForm, SubmitHandler } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Box, Collapse } from '@material-ui/core';

import { Properties, RootProperties } from 'renderer/domain/Properties';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import useAlert from 'renderer/hook/alert/useAlert';

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
  allProperties4Set: string[];
  refetch: () => void;
}

export interface PropertiesUpdateGraphql {
  updateProperties: Properties;
}

export const MUTATION_PROPERTIES = gql`
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
    p4s: string;
  }[];
};

export default function PropertiesFrom(props: FormProps) {
  const { defaultValues, properties4Set, allProperties4Set, refetch } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const allDefaultProperties = allProperties4Set.map((p4s) => {
    const properties = _.at(defaultValues, p4s)[0];
    const defaultProperties = _.keys(properties)
      .filter((pk) => !['id', 'label', 'available', 'value'].includes(pk))
      .map((fk) => {
        const childProp = properties[fk] as Properties;
        return _.defaults({ p4s }, childProp);
      });
    return defaultProperties;
  });
  const flatAllDefaultProperties = _.flatMap(allDefaultProperties);
  const { handleSubmit, register } = useForm<FormResult>({
    defaultValues: { props: flatAllDefaultProperties },
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
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<FormResult> = async (form) => {
    const properties = form.props
      .filter((p) => p.p4s === properties4Set)
      .map((it) => _.omit(it, ['p4s']));
    await updateProperties({ variables: { properties } });
    refetch();
  };

  return (
    <div className={classes.paper}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        {flatAllDefaultProperties &&
          flatAllDefaultProperties.map((childProp, index) => {
            return (
              <Collapse
                key={`${properties4Set}.${childProp.id}`}
                in={properties4Set === childProp.p4s}
              >
                <Box>
                  <TextField
                    value={childProp.id}
                    type="hidden"
                    {...register(`props.${index}.id`, { valueAsNumber: true })}
                  />
                  <TextField
                    value={childProp.p4s}
                    type="hidden"
                    {...register(`props.${index}.p4s`)}
                  />
                  <TextField
                    key={childProp.value}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    multiline
                    label={t(childProp.label)}
                    id={`${properties4Set}.${childProp.id}.value`}
                    {...register(`props.${index}.value`)}
                  />
                </Box>
              </Collapse>
            );
          })}
        <SubmitButton />
      </form>
    </div>
  );
}
