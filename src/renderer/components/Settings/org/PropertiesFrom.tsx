/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from 'react-i18next';
import { gql, useMutation, useQuery } from '@apollo/client';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Divider, InputAdornment, Typography } from '@material-ui/core';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import ReplyIcon from '@material-ui/icons/Reply';
import InfoIcon from '@material-ui/icons/Info';
import PublicIcon from '@material-ui/icons/Public';

import { Properties } from 'renderer/domain/Properties';
import { useEffect, useMemo } from 'react';
import { debounceTime, Subject } from 'rxjs';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      maxWidth: '500px',
      margin: theme.spacing(0, 5, 0),
    },
    title: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  })
);

interface Graphql {
  getAllProperties: string;
}

const QUERY = gql`
  query Properties {
    getAllProperties
  }
`;

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

type PropUpdateDto = {
  id: number;
  value: string;
};

const subjectSubmit = new Subject<PropUpdateDto>();

export default function PropertiesFrom() {
  const classes = useStyles();
  const { t } = useTranslation();

  const { data } = useQuery<Graphql>(QUERY, {
    fetchPolicy: 'no-cache',
  });

  let properties: Properties | undefined = useMemo(
    () =>
      data?.getAllProperties ? JSON.parse(data?.getAllProperties) : undefined,
    [data]
  );

  properties = properties?.sys as Properties;

  const [updateProperties] =
    useMutation<PropertiesUpdateGraphql>(MUTATION_PROPERTIES);

  const momeSubject = useMemo(() => {
    return subjectSubmit.pipe(debounceTime(2000)).subscribe({
      next: (it) => {
        updateProperties({ variables: { properties: it } });
      },
    });
  }, [updateProperties]);

  useEffect(() => {
    return () => {
      momeSubject.unsubscribe();
    };
  }, [momeSubject]);

  return (
    <div className={classes.paper}>
      {properties && (
        <>
          <Typography variant="body1" className={classes.title}>
            {t('Automatic Reply')}
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            type="number"
            defaultValue={properties.autoReply?.timeout?.value}
            label={t('Timeout (Minutes)')}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              inputProps: { min: 0, max: 30 },
              startAdornment: (
                <InputAdornment position="start">
                  <AccessAlarmIcon />
                </InputAdornment>
              ),
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              const number = parseInt(value, 10);
              const id = properties?.autoReply?.timeout?.id;
              if (number && id) {
                subjectSubmit.next({
                  id,
                  value,
                });
              }
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            defaultValue={properties.autoReply?.content?.value}
            label={t('Reply Content')}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ReplyIcon />
                </InputAdornment>
              ),
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              const id = properties?.clientTimeout?.timeout?.id;
              if (value && id) {
                subjectSubmit.next({
                  id,
                  value,
                });
              }
            }}
          />
          <Divider />
          <Typography variant="body1" className={classes.title}>
            {t('Turn to Manual Reminder')}
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            defaultValue={properties.transfer.content?.value}
            label={t(
              'Switch to manual reminder (${name} is customer service nickname)'
            )}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InfoIcon />
                </InputAdornment>
              ),
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              const id = properties?.clientTimeout?.timeout?.id;
              if (value && id) {
                subjectSubmit.next({
                  id,
                  value,
                });
              }
            }}
          />
          <Divider />
          <Typography variant="body1" className={classes.title}>
            {t('Client Timed Out')}
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            type="number"
            defaultValue={properties.clientTimeout?.timeout?.value}
            label={t('Timeout (minutes) up to 40 minutes')}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              inputProps: { min: 0, max: 30 },
              startAdornment: (
                <InputAdornment position="start">
                  <AccessAlarmIcon />
                </InputAdornment>
              ),
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              const number = parseInt(value, 10);
              const id = properties?.clientTimeout?.timeout?.id;
              if (number && id) {
                subjectSubmit.next({
                  id,
                  value,
                });
              }
            }}
          />
          <Divider />
          <Typography variant="body1" className={classes.title}>
            {t('ERP Setting')}
          </Typography>
          <Typography variant="body2" className={classes.title}>
            {t(
              'ERP url address (GET https://example.com/api?uid=${uid} , uid is the transmitted user uid variable, which will automatically replace by the system)'
            )}
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            defaultValue={properties?.erp?.url?.value}
            label={t('ERP url address')}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PublicIcon />
                </InputAdornment>
              ),
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              const id = properties?.erp?.url?.id;
              if (value && id) {
                subjectSubmit.next({
                  id,
                  value,
                });
              }
            }}
          />
          <Divider />
          <Typography variant="body1" className={classes.title}>
            {t('Queue reminder')}
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            defaultValue={properties?.queue?.content?.value}
            label={t('Queue reminder (${queue} is the queue number)')}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InfoIcon />
                </InputAdornment>
              ),
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              const id = properties?.queue?.content?.id;
              if (value && id) {
                subjectSubmit.next({
                  id,
                  value,
                });
              }
            }}
          />
        </>
      )}
    </div>
  );
}
