/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  makeStyles,
  Theme,
  createStyles,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Snackbar,
  Divider,
} from '@material-ui/core';
import Upload from 'rc-upload';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getDownloadS3ChatImgPath,
  getUploadS3ChatPath,
} from 'renderer/config/clientConfig';
import usePropetyByKey from 'renderer/domain/graphql/Properties';
import { PureProperties } from 'renderer/domain/Properties';
import useAlert from 'renderer/hook/alert/useAlert';
import { CustomerAlert } from 'renderer/components/StaffForm/StaffShuntForm';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import _ from 'lodash';
import {
  PropertiesUpdateGraphql,
  MUTATION_PROPERTIES,
} from '../org/PropertiesFrom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '500px',
      margin: theme.spacing(0, 5, 0),
    },
    alert: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    button: {
      marginRight: theme.spacing(2),
    },
    divider: {
      marginTop: theme.spacing(2),
    },
  })
);

interface FormType {
  ringtones: PureProperties | undefined;
}

export default function Client() {
  const classes = useStyles();
  const { t } = useTranslation();

  const { prop, refetch } = usePropetyByKey('client.setting.ringtones');
  const [uploading, setUploading] = useState<boolean>();
  const [error, setError] = useState<string>();

  const { handleSubmit, register, setValue, watch } = useForm<FormType>({
    defaultValues: { ringtones: _.defaults({ label: '自定义提示音' }, prop) },
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

  const onSubmit: SubmitHandler<FormType> = async (form) => {
    if (form.ringtones) {
      form.ringtones.id =
        form.ringtones.id === 0 ? undefined : form.ringtones.id;
      form.ringtones.personal = true;
    }
    const properties = [form.ringtones];
    await updateProperties({ variables: { properties } });
    await refetch();
    if (form.ringtones?.value) {
      const url = `${getDownloadS3ChatImgPath()}${form.ringtones?.value}`;
      window.audio = new Audio(url);
    }
  };

  const handleClose = (_event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(undefined);
  };

  const onDeleteRingtonesClick = () => {
    setValue('ringtones.value', undefined);
  };

  const ringtonesUploadProps = {
    action: getUploadS3ChatPath(),
    multiple: false,
    accept: 'audio/*',
    onStart() {
      setUploading(true);
    },
    onSuccess(response: unknown) {
      const logoId = (response as string[])[0];
      setValue('ringtones.value', logoId);
      setUploading(false);
    },
    onError(e: Error) {
      setUploading(false);
      setError(e.message);
    },
  };

  const audioUrl = prop?.value ?? watch().ringtones?.value;

  return (
    <div className={classes.root}>
      {uploading && <CircularProgress />}
      <Snackbar
        open={error !== undefined}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <CustomerAlert onClose={handleClose} severity="error">
          {`${t('Upload failed')}:`}
          {error}
        </CustomerAlert>
      </Snackbar>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={prop?.id || ''}
          type="hidden"
          {...register(`ringtones.id`, { valueAsNumber: true })}
        />
        <TextField type="hidden" {...register(`ringtones.key`)} />
        <TextField type="hidden" {...register(`ringtones.label`)} />
        <TextField type="hidden" {...register(`ringtones.value`)} />
        <Typography variant="body1" className={classes.alert}>
          {t('Custom ringtones')}
        </Typography>
        <Grid container>
          <Grid item className={classes.button}>
            {audioUrl ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  const audio = new Audio(
                    `${getDownloadS3ChatImgPath()}${audioUrl}`
                  );
                  audio.play();
                }}
              >
                {t('Play')}
              </Button>
            ) : (
              <Upload {...ringtonesUploadProps}>
                <Button variant="contained" color="primary">
                  {t('Upload')}
                </Button>
              </Upload>
            )}
          </Grid>
          <Grid item className={classes.button}>
            <Button color="secondary" onClick={onDeleteRingtonesClick}>
              {t('Delete')}
            </Button>
          </Grid>
        </Grid>
        <Divider key="divider" className={classes.divider} />,
        <SubmitButton />
      </form>
    </div>
  );
}
