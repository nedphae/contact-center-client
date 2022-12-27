/* eslint-disable react/jsx-props-no-spreading */
import _ from 'lodash';
import { Object } from 'ts-toolbelt';
import { v4 as uuidv4 } from 'uuid';
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Viewer from 'react-viewer';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import {
  Dialog,
  DialogContent,
  FormControlLabel,
  Checkbox,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  Menu,
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import {
  MUTATION_QUICK_REPLY,
  MUTATION_QUICK_REPLY_GROUP,
} from 'renderer/domain/graphql/QuickReply';
import { QuickReply, QuickReplyGroup } from 'renderer/domain/Chat';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import useAlert from 'renderer/hook/alert/useAlert';
import { DialogTitle } from 'renderer/components/DraggableDialog/DraggableDialog';
import { useState } from 'react';
import {
  getDownloadS3ChatImgPath,
  getUploadS3ChatPath,
} from 'renderer/config/clientConfig';
import Upload from 'rc-upload';
import { RcFile } from 'rc-upload/lib/interface';
import { TouchableOpacity } from 'react-native-web';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      marginRight: theme.spacing(2),
    },
    root: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flexGrow: 1,
    },
  })
);

interface QuickReplyGraphql {
  addQuickReply: { id: number };
}
interface QuickReplyGroupGraphql {
  addQuickReplyGroup: { id: number };
}

interface DefaultFormProps {
  open: boolean;
  handleClose: () => void;
  refetch: () => void;
}

// 去除掉没用的循环属性
type FormType = Object.Omit<QuickReply, 'group'>;

type QuickReplyFormProps = Object.Merge<
  {
    defaultValues?: FormType;
    quickReplyGroup: QuickReplyGroup[];
  },
  DefaultFormProps
>;

export function QuickReplyForm(props: QuickReplyFormProps) {
  const { open, handleClose, defaultValues, refetch, quickReplyGroup } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showImageViewerDialog, toggleShowImageViewerDialog] = useState(false);
  const [imageViewer, setImageViewer] = useState<ImageDecorator>({
    src: '',
    alt: undefined,
  });

  if (defaultValues?.content) {
    defaultValues.contentJson = JSON.parse(defaultValues.content);
  }
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues,
    shouldUnregister: true,
  });

  const { fields, append, remove, update } = useFieldArray({
    name: 'contentJson',
    control,
  });

  const { onLoadding, onCompleted, onError, onErrorMsg } = useAlert();
  const [addQuickReply, { loading }] = useMutation<QuickReplyGraphql>(
    MUTATION_QUICK_REPLY,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<FormType> = async (form) => {
    form.content = JSON.stringify(form.contentJson);
    await addQuickReply({
      variables: { quickReplyInput: _.omit(form, '__typename', 'contentJson') },
    });
    await refetch();
  };

  function removeRefQuestion(index: number) {
    remove(index);
  }
  const appendRefQuestion = (type: string) => {
    append({ type });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  function openImageViewer(src: string, alt: string) {
    setImageViewer({ src, alt });
    toggleShowImageViewerDialog(true);
  }

  const closeImageViewerDialog = () => {
    toggleShowImageViewerDialog(false);
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" onClose={handleClose}>
        {t('Add Quick Reply')}
      </DialogTitle>
      <DialogContent>
        <div className={classes.root}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <TextField
              value={defaultValues?.id || ''}
              type="hidden"
              {...register('id', { valueAsNumber: true })}
            />
            <Controller
              control={control}
              name="groupId"
              defaultValue={undefined}
              render={({
                field: { onChange, value },
                fieldState: { invalid, error: groupIdError },
              }) => (
                <FormControl
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  error={invalid}
                >
                  <InputLabel id="demo-mutiple-chip-label">
                    {t('Group')}
                  </InputLabel>
                  <Select
                    labelId="groupId"
                    id="groupId"
                    // see https://github.com/react-hook-form/react-hook-form/issues/3963
                    onChange={(event) => {
                      const groupId = event.target.value as string;
                      onChange(
                        groupId === '' || !groupId ? undefined : +groupId
                      );
                    }}
                    value={value}
                    label={t('Group')}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {quickReplyGroup &&
                      quickReplyGroup.map((it) => {
                        return (
                          <MenuItem key={it.id} value={it.id}>
                            {it.groupName}
                          </MenuItem>
                        );
                      })}
                  </Select>
                  {invalid && (
                    <FormHelperText>{groupIdError?.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              autoFocus
              id="title"
              label={t('Quick reply title')}
              error={errors.title && true}
              helperText={errors.title?.message}
              {...register('title', {
                maxLength: {
                  value: 80,
                  message: t(
                    'Quick reply title length cannot be greater than 80 characters'
                  ),
                },
              })}
            />
            {fields &&
              fields.map((content, index) => {
                if (content.type === 'IMAGE') {
                  const picSrc: string | undefined = content.content;
                  const imgUploadProps = {
                    action: `${getUploadS3ChatPath()}`,
                    multiple: false,
                    accept: 'image/*',
                    onSuccess(response: unknown) {
                      // 设置图片地址
                      update(index, {
                        type: 'IMAGE',
                        content: (response as string[])[0],
                      });
                    },
                    onError(error: Error, _ret: any, _file: RcFile) {
                      onErrorMsg('Image upload failed');
                    },
                  };
                  return (
                    <Grid
                      key={uuidv4().substring(0, 8)}
                      container
                      alignItems="center"
                    >
                      <TextField
                        value="IMAGE"
                        type="hidden"
                        {...register(`contentJson.${index}.type`)}
                      />
                      <Grid item sm={5}>
                        <Upload {...imgUploadProps}>
                          <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                          >
                            {picSrc ? t('Change picture') : t('Add picture')}
                          </Button>
                        </Upload>
                      </Grid>
                      <Grid item sm={4}>
                        <IconButton
                          aria-label="delete"
                          style={{ height: '100%' }}
                          onClick={() => {
                            removeRefQuestion(index);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                      <Grid item sm={3}>
                        {picSrc && (
                          <TouchableOpacity
                            onPress={() => {
                              openImageViewer(
                                `${getDownloadS3ChatImgPath()}${picSrc}`,
                                'img'
                              );
                            }}
                          >
                            <img
                              src={`${getDownloadS3ChatImgPath()}${picSrc}`}
                              style={{ maxHeight: '48px', maxWidth: '60px' }}
                              alt="Message"
                            />
                          </TouchableOpacity>
                        )}
                      </Grid>
                    </Grid>
                  );
                }
                return (
                  <Grid
                    key={uuidv4().substring(0, 8)}
                    container
                    alignItems="center"
                  >
                    <Grid item lg={10}>
                      <TextField
                        value="TEXT"
                        type="hidden"
                        {...register(`contentJson.${index}.type`)}
                      />
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        multiline
                        label={t('Quick reply content')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <QuestionAnswerIcon />
                            </InputAdornment>
                          ),
                        }}
                        error={
                          errors.contentJson &&
                          errors.contentJson[index] &&
                          true
                        }
                        helperText={
                          errors.contentJson &&
                          errors.contentJson[index] &&
                          errors.contentJson[index]?.content?.message
                        }
                        {...register(`contentJson.${index}.content`, {
                          required: t('Similar questions are required'),
                          maxLength: {
                            value: 500,
                            message: t(
                              'Question length cannot be greater than 500 characters'
                            ),
                          },
                        })}
                      />
                    </Grid>
                    <Grid item lg={2}>
                      <IconButton
                        aria-label="delete"
                        style={{ height: '100%' }}
                        onClick={() => {
                          removeRefQuestion(index);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              })}
            <Grid container spacing={1}>
              <Grid item lg={12}>
                <Button onClick={handleMenuClick} startIcon={<AddIcon />}>
                  {t('Add Quick Reply')}
                </Button>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      appendRefQuestion('IMAGE');
                      handleMenuClose();
                    }}
                  >
                    {t('message-type.IMAGE')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      appendRefQuestion('TEXT');
                      handleMenuClose();
                    }}
                  >
                    {t('message-type.TEXT')}
                  </MenuItem>
                </Menu>
              </Grid>
              <Grid item lg={12}>
                <Controller
                  control={control}
                  defaultValue
                  name="personal"
                  render={({ field: { onChange, value } }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                      }
                      label={t('Is personal')}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <SubmitButton />
          </form>
          <Viewer
            visible={showImageViewerDialog}
            onClose={closeImageViewerDialog}
            images={[imageViewer]}
            zIndex={2000}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

type QuickReplyGroupFormType = Object.Omit<QuickReplyGroup, 'quickReply'>;

type QuickReplyGroupFormProps = Object.Merge<
  {
    defaultValues?: QuickReplyGroupFormType;
  },
  DefaultFormProps
>;

export function QuickReplyGroupForm(props: QuickReplyGroupFormProps) {
  const { open, handleClose, defaultValues, refetch } = props;
  const { t } = useTranslation();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<QuickReplyGroupFormType>({
    defaultValues,
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [addQuickReplyGroup, { loading }] = useMutation<QuickReplyGroupGraphql>(
    MUTATION_QUICK_REPLY_GROUP,
    {
      onCompleted,
      onError,
    }
  );
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<QuickReplyGroupFormType> = async (form) => {
    await addQuickReplyGroup({
      variables: {
        quickReplyGroupInput: _.omit(form, '__typename', 'quickReply'),
      },
    });
    await refetch();
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" onClose={handleClose}>
        {t('Add Quick Reply Group')}
      </DialogTitle>
      <DialogContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <TextField
            value={defaultValues?.id || ''}
            type="hidden"
            {...register('id', { valueAsNumber: true })}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            autoFocus
            id="groupName"
            label={t('Group Name')}
            error={errors.groupName && true}
            helperText={errors.groupName?.message}
            {...register('groupName', {
              maxLength: {
                value: 50,
                message: t(
                  'Group name length cannot be greater than 50 characters'
                ),
              },
            })}
          />
          <Controller
            control={control}
            defaultValue
            name="personal"
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label={t('Is personal')}
              />
            )}
          />
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}

QuickReplyForm.defaultProps = {
  defaultValues: undefined,
};

QuickReplyGroupForm.defaultProps = {
  defaultValues: undefined,
};
