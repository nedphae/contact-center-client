/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import _ from 'lodash';

import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import GroupIcon from '@material-ui/icons/Group';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TitleIcon from '@material-ui/icons/Title';
import LinkIcon from '@material-ui/icons/Link';
import CodeIcon from '@material-ui/icons/Code';
import HttpsIcon from '@material-ui/icons/Https';
import {
  Typography,
  Link,
  FormControl,
  InputLabel,
  FormHelperText,
  MenuItem,
  Input,
  Select,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Slider,
  Switch,
  CircularProgress,
  Snackbar,
  Chip,
  Button,
} from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Upload from 'rc-upload';

import config, {
  getDownloadS3ChatImgPath,
  getUploadS3ChatImgPath,
} from 'app/config/clientConfig';
import Staff, {
  ShuntClass,
  StaffConfig,
  StaffShunt,
} from 'app/domain/StaffInfo';
import { ShuntUIConfig } from 'app/domain/Config';

import './Jsoneditor.global.css';
import useAlert from 'app/hook/alert/useAlert';
import { TopicGraphql, QUERY_BOT_TOPIC } from 'app/domain/graphql/Bot';
import SubmitButton from '../Form/SubmitButton';

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
        ? theme.typography.fontWeightLight
        : theme.typography.fontWeightBold,
  };
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    root: {
      width: '100%',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    icon: {
      verticalAlign: 'bottom',
      height: 20,
      width: 20,
    },
    details: {
      alignItems: 'center',
    },
    column: {
      flexBasis: '50%',
    },
    helper: {
      borderLeft: `2px solid ${theme.palette.divider}`,
      padding: theme.spacing(1, 2),
    },
    link: {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
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

// 去除掉没用的循环属性
type FormType = Object.Omit<StaffShunt, 'staffList'>;

interface FormProps {
  defaultValues: FormType | undefined;
  shuntClassList: ShuntClass[];
  staffList: Staff[];
}

interface Graphql {
  saveShunt: FormType | undefined;
}

const MUTATION_STAFF_SHUNT = gql`
  mutation StaffShunt($shuntInput: ShuntInput!) {
    saveShunt(shunt: $shuntInput) {
      id
      organizationId
      shuntClassId
      name
      code
      openPush
      authorizationToken
    }
  }
`;

interface ChatUIConfigGraphql {
  chatUIConfig: ShuntUIConfig | undefined;
  saveChatUIConfig: ShuntUIConfig | undefined;
}

const MUTATION_UICONFIG = gql`
  mutation ChatUIConfig($shuntUIConfig: ShuntUIConfigInput!) {
    saveChatUIConfig(uiConfig: $shuntUIConfig) {
      id
      shuntId
      config
    }
  }
`;

const QUERY_CHATUI_CONFIG = gql`
  query ChatUIConfig($shuntId: Long!) {
    chatUIConfig(shuntId: $shuntId) {
      id
      shuntId
      config
    }
  }
`;

interface StaffConfigGraphql {
  staffConfigByShuntId: StaffConfig[];
}

interface SavedStaffConfigGraphql {
  saveStaffConfig: StaffConfig[];
}

const QUERY_STAFF_CONFIG = gql`
  query StaffConfig($shuntId: Long!) {
    staffConfigByShuntId(shuntId: $shuntId) {
      id
      shuntId
      staffId
      priority
    }
  }
`;

const MUTATION_STAFF_CONFIG = gql`
  mutation StaffConfig($staffConfigList: [StaffConfigInput!]!) {
    saveStaffConfig(staffConfigList: $staffConfigList) {
      id
      shuntId
      staffId
      priority
    }
  }
`;

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function StaffShuntForm(props: FormProps) {
  const { defaultValues, shuntClassList, staffList } = props;
  const theme = useTheme();
  const classes = useStyles();

  const jsoneditorRef = useRef<HTMLDivElement>(null);
  const [jsoneditor, setJsoneditor] = useState<JSONEditor>();
  const [tempStaffConfig, setTempStaffConfig] = useState<StaffConfig[]>();
  const [chatUIConfigObj, setChatUIConfigObj] = useState<any>();

  const { data: allTopic } = useQuery<TopicGraphql>(QUERY_BOT_TOPIC, {
    fetchPolicy: 'no-cache',
  });

  const [uploading, setUploading] = useState<boolean>();
  const [error, setError] = useState<string>();

  const updateChatUIConfig = useCallback(
    function updateChatUIConfig(newChatUIConfigObj: any) {
      jsoneditor?.update(newChatUIConfigObj);
      setChatUIConfigObj(newChatUIConfigObj);
    },
    [jsoneditor]
  );

  const imgUploadProps = useMemo(() => {
    return {
      action: getUploadS3ChatImgPath(),
      multiple: false,
      accept: 'image/png,image/gif,image/jpeg',
      onStart() {
        setUploading(true);
      },
      onSuccess(response: unknown) {
        const logoId = (response as string[])[0];
        const newChatUIConfigObj = _.defaultsDeep(
          {
            navbar: {
              logo: `${getDownloadS3ChatImgPath()}${logoId}`,
            },
          },
          jsoneditor?.get()
        );
        updateChatUIConfig(newChatUIConfigObj);
        setUploading(false);
      },
      onError(e: Error) {
        setUploading(false);
        setError(e.message);
      },
    };
  }, [jsoneditor, updateChatUIConfig]);

  const avatarUploadProps = useMemo(() => {
    return {
      action: getUploadS3ChatImgPath(),
      multiple: false,
      accept: 'image/png,image/gif,image/jpeg',
      onStart() {
        setUploading(true);
      },
      onSuccess(response: unknown) {
        const logoId = (response as string[])[0];
        const newChatUIConfigObj = _.defaultsDeep(
          {
            robot: {
              avatar: `${getDownloadS3ChatImgPath()}${logoId}`,
            },
          },
          jsoneditor?.get()
        );
        updateChatUIConfig(newChatUIConfigObj);
        setUploading(false);
      },
      onError(e: Error) {
        setUploading(false);
        setError(e.message);
      },
    };
  }, [jsoneditor, updateChatUIConfig]);

  function onDeleteLogoClick() {
    let newChatUIConfigObj = jsoneditor?.get();
    newChatUIConfigObj = _.omit(newChatUIConfigObj, 'navbar.logo');
    updateChatUIConfig(newChatUIConfigObj);
  }

  function onDeleteAvatarClick() {
    let newChatUIConfigObj = jsoneditor?.get();
    newChatUIConfigObj = _.omit(newChatUIConfigObj, 'robot.avatar');
    updateChatUIConfig(newChatUIConfigObj);
  }

  const { handleSubmit, register, control, watch } = useForm<FormType>({
    defaultValues,
    shouldUnregister: true,
  });

  const shuntCode = watch('code');
  const webLink = `${config.web.host}/chat/?sc=${shuntCode}`;
  const webEmbeddedASync = `const js = document.createElement('script');
js.async = true;
js.src = 'https://im.xbcs.top/chat/web-embedded.js';
document.body.appendChild(js);
js.onload = () => {
  const params = {
  // 接待组代码
  sc: 'Cxl1TwUHjw',
  // 可空，uid，企业当前登录用户标识，不传表示匿名用户，由客服系统自动生成
  // uid: 'my-company-uid',
  // 可空，指定客服 Id，如果不传，则由系统自动分配客服
  // staffId: '',
  // 可空，指定客服组 Id
  // groupid: '',
  // 可空，客户名称，如果不传，则由系统自动生成，如果客服系统已经有该客户信
  // name: '',
  // 可空，客户邮箱
  // email: '',
  // 可空，客户手机号码
  // mobile: '',
  // 可空，客户 Vip 等级
  // vipLevel: '',
  // 可空，客户当前咨询页标题
  // title: '',
  // 可空，客户当前咨询页
  // referrer: '',
};
initXiaobaiChat(params);
};`;
  const webEmbedded = `<script src="${config.web.host}/chat/web-embedded.js"></script>
<script>
    const params = {
        // 接待组代码
        sc: '${shuntCode}',
        // 可空，uid，企业当前登录用户标识，不传表示匿名用户，由客服系统自动生成
        // uid: 'my-company-uid',
        // 可空，指定客服 Id，如果不传，则由系统自动分配客服
        // staffId: '',
        // 可空，指定客服组 Id
        // groupid: '',
        // 可空，客户名称，如果不传，则由系统自动生成，如果客服系统已经有该客户信息（uid 关联），则会忽略
        // name: '',
        // 可空，客户邮箱
        // email: '',
        // 可空，客户手机号码
        // mobile: '',
        // 可空，客户 Vip 等级
        // vipLevel: '',
        // 可空，客户当前咨询页标题
        // title: '',
        // 可空，客户当前咨询页
        // referrer: '',
    }
    initXiaobaiChat(params);
</script>`;

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveStaffShunt, { loading, data }] = useMutation<Graphql>(
    MUTATION_STAFF_SHUNT,
    {
      onCompleted,
      onError,
    }
  );
  const [saveChatUIConfig, { loading: uiLoading, data: savedChatUIConfig }] =
    useMutation<ChatUIConfigGraphql>(MUTATION_UICONFIG, {
      onCompleted,
      onError,
    });
  const [getChatUIConfig, { data: chatUIConfig }] =
    useLazyQuery<ChatUIConfigGraphql>(QUERY_CHATUI_CONFIG, {
      fetchPolicy: 'no-cache',
    });
  const [getStaffConfigList, { data: staffConfigList }] =
    useLazyQuery<StaffConfigGraphql>(QUERY_STAFF_CONFIG, {
      fetchPolicy: 'no-cache',
    });
  const [
    saveStaffConfig,
    { loading: configLoading, data: savedStaffConfigList },
  ] = useMutation<SavedStaffConfigGraphql>(MUTATION_STAFF_CONFIG, {
    onCompleted,
    onError,
  });
  const loadingAll = loading || uiLoading || configLoading;
  if (loadingAll) {
    onLoadding(loadingAll);
  }

  useEffect(() => {
    const staffConfigMap = _.groupBy(
      savedStaffConfigList?.saveStaffConfig ??
        staffConfigList?.staffConfigByShuntId,
      'staffId'
    );
    // 根据获取的 StaffConfig list 创建一个临时列
    const scl = staffList.map((staff) => {
      const sc = staffConfigMap[staff.id];
      if (sc) {
        return _.assign(
          {
            staffName: staff.realName,
            staffType: staff.staffType,
            enabled: true,
          },
          sc[0]
        );
      }
      return {
        shuntId: defaultValues?.id,
        priority: 15,
        staffId: staff.id,
        staffName: staff.realName,
        staffType: staff.staffType,
        enabled: false,
      };
    });
    setTempStaffConfig(scl);
  }, [defaultValues, savedStaffConfigList, staffConfigList, staffList]);

  useEffect(() => {
    if (jsoneditorRef.current && !jsoneditor) {
      const options: JSONEditorOptions = {
        modes: ['tree', 'code'],
        onChangeText: (jsonString: string) => {
          setChatUIConfigObj(JSON.parse(jsonString));
        },
      };
      const editor = new JSONEditor(jsoneditorRef.current, options);
      editor.setText(
        '{"navbar":{"title":"智能助理"},"toolbar":[{"type":"image","icon":"image","title":"图片"}],"robot":{"avatar":"https://gw.alicdn.com/tfs/TB1U7FBiAT2gK0jSZPcXXcKkpXa-108-108.jpg"},"agent":{"quickReply":{"icon":"message","name":"召唤人工客服","isHighlight":true}},"messages":[{"type":"text","content":{"text":"智能助理为您服务，请问有什么可以帮您？:"}}],"placeholder":"输入任何您的问题","loadMoreText":"点击加载历史消息"}'
      );
      setJsoneditor(editor);
    }
    if (defaultValues && defaultValues.id) {
      getChatUIConfig({
        variables: { shuntId: defaultValues.id },
      });
      getStaffConfigList({
        variables: { shuntId: defaultValues.id },
      });
    }
    return () => {
      if (jsoneditor) {
        jsoneditor.destroy();
        setJsoneditor(undefined);
      }
    };
  }, [defaultValues, getChatUIConfig, getStaffConfigList, jsoneditor]);

  useEffect(() => {
    if (jsoneditorRef.current && jsoneditor) {
      if (
        chatUIConfig &&
        chatUIConfig.chatUIConfig &&
        chatUIConfig.chatUIConfig.config
      ) {
        jsoneditor.setText(chatUIConfig.chatUIConfig.config);
        setChatUIConfigObj(jsoneditor.get());
      }
    }
  }, [chatUIConfig, jsoneditor]);

  useEffect(() => {
    if (jsoneditorRef.current && jsoneditor) {
      if (
        savedChatUIConfig &&
        savedChatUIConfig.saveChatUIConfig &&
        savedChatUIConfig.saveChatUIConfig.config
      ) {
        jsoneditor.updateText(savedChatUIConfig.saveChatUIConfig.config);
      }
    }
  }, [savedChatUIConfig, jsoneditor]);

  const onSubmit: SubmitHandler<FormType> = async (form) => {
    const shuntResult = await saveStaffShunt({
      variables: { shuntInput: _.omit(form, '__typename') },
    });
    if (shuntResult.data && shuntResult.data.saveShunt) {
      const shuntUIConfig: ShuntUIConfig = {
        id: chatUIConfig?.chatUIConfig?.id,
        shuntId: shuntResult.data.saveShunt.id,
        config: jsoneditor?.getText(),
      };
      saveChatUIConfig({
        variables: { shuntUIConfig: _.omit(shuntUIConfig, '__typename') },
      });
      if (tempStaffConfig) {
        const forSave = tempStaffConfig
          .filter((sc) => sc.enabled)
          .map((sc) =>
            _.pick(
              _.defaults({ shuntId: shuntResult?.data?.saveShunt?.id }, sc),
              ['shuntId', 'priority', 'staffId']
            )
          );
        saveStaffConfig({
          variables: { staffConfigList: forSave },
        });
      }
    }
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const changed = tempStaffConfig?.map((sc) => {
      if (sc.staffId === parseInt(event.target.value, 10)) {
        return _.assign(sc, { enabled: event.target.checked });
      }
      return sc;
    });
    setTempStaffConfig(changed);
  };

  const handleSliderChange =
    (staffId?: number) =>
    (_event: React.ChangeEvent<unknown>, value: number | number[]) => {
      const changed = tempStaffConfig?.map((sc) => {
        if (sc.staffId === staffId) {
          return _.assign(sc, { priority: value });
        }
        return sc;
      });
      setTempStaffConfig(changed);
    };

  const handleClose = (_event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(undefined);
  };

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newChatUIConfigObj = _.defaultsDeep(
      {
        navbar: {
          title: event.target.value,
        },
      },
      jsoneditor?.get()
    );
    updateChatUIConfig(newChatUIConfigObj);
  }

  function handleWelcomeMessageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const newChatUIConfigObj = _.defaultsDeep(
      {
        messages: [
          {
            type: 'text',
            content: {
              text: event.target.value,
            },
          },
        ],
      },
      jsoneditor?.get()
    );
    updateChatUIConfig(newChatUIConfigObj);
  }

  function handleConnectIdChange(
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) {
    let newChatUIConfigObj = jsoneditor?.get();
    if (event.target.value) {
      newChatUIConfigObj = _.assign(newChatUIConfigObj, {
        connectIds: event.target.value as string[],
      });
    } else {
      newChatUIConfigObj = _.omit(newChatUIConfigObj, 'connectIds');
    }
    updateChatUIConfig(newChatUIConfigObj);
  }

  function handleConnectIdDelete(connectId: string) {
    let newChatUIConfigObj = jsoneditor?.get();
    newChatUIConfigObj = _.assign(newChatUIConfigObj, {
      connectIds: newChatUIConfigObj.connectIds.filter(
        (it: string) => it !== connectId
      ),
    });
    updateChatUIConfig(newChatUIConfigObj);
  }

  function createStaffConfigList(sc: StaffConfig) {
    return (
      <Grid key={sc.staffId} container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <Switch
            checked={sc.enabled}
            onChange={handleSwitchChange}
            name={sc.staffName}
            value={sc.staffId}
            inputProps={{ 'aria-label': 'secondary checkbox' }}
          />
        </Grid>
        <Grid item xs={8}>
          <div className={classes.root}>
            <Typography id="discrete-slider-small-steps" gutterBottom>
              {sc.staffName}
            </Typography>
            <Slider
              className={classes.root}
              defaultValue={15}
              value={sc.priority}
              onChange={handleSliderChange(sc.staffId)}
              aria-labelledby="discrete-slider-small-steps"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={15}
            />
          </div>
        </Grid>
      </Grid>
    );
  }
  return (
    <div className={classes.paper}>
      {uploading && <CircularProgress />}
      <Snackbar
        open={error !== undefined}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          上传失败:{error}
        </Alert>
      </Snackbar>
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveShunt?.id || ''}
          type="hidden"
          {...register('id', { maxLength: 100, valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="shuntClassId"
          rules={{ required: '接待组分类必选' }}
          render={({
            field: { onChange, value },
            fieldState: { invalid, error: shuntClassIdError },
          }) => (
            <FormControl
              variant="outlined"
              margin="normal"
              fullWidth
              error={invalid}
            >
              <InputLabel id="demo-mutiple-chip-label">接待组分类</InputLabel>
              <Select
                labelId="shuntClassId"
                id="shuntClassId"
                onChange={onChange}
                value={value || ''}
                label="接待组分类"
              >
                {shuntClassList &&
                  shuntClassList.map((it) => {
                    return (
                      <MenuItem key={it.id} value={it.id}>
                        {it.className}
                      </MenuItem>
                    );
                  })}
              </Select>
              {invalid && (
                <FormHelperText>{shuntClassIdError?.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          label="接待组名称"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          {...register('name', {
            required: '必须设置接待组名称',
            maxLength: {
              value: 50,
              message: '接待组名称不能大于50位',
            },
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="code"
          label="接待组链接代码"
          value={defaultValues?.code || data?.saveShunt?.code || ''}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            ),
          }}
          {...register('code')}
        />
        {shuntCode && webLink && (
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="webJs"
            label="web 链接接入（uid 等参数可以添加到 url 参数后）"
            value={webLink}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <CodeIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        {shuntCode && webLink && (
          <Link target="_blank" href={webLink}>
            测试接待组链接
          </Link>
        )}
        {shuntCode && (
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            id="webJs"
            label="web-js 弹窗接入"
            value={webEmbedded}
            InputProps={{
              readOnly: true,
            }}
          />
        )}
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="openPush"
          label="接待组推送地址"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            ),
          }}
          {...register('openPush')}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="authorizationToken"
          label="推送地址认证Token（如果不验证Token可为空）"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <HttpsIcon />
              </InputAdornment>
            ),
          }}
          {...register('authorizationToken')}
        />
        <Grid container>
          <Grid item xs={7}>
            <Upload {...imgUploadProps}>
              <Typography variant="body1">
                自定义导航栏Logo（点击头像或上传添加/修改）
              </Typography>
              {chatUIConfigObj && chatUIConfigObj.navbar.logo ? (
                <img
                  src={chatUIConfigObj.navbar.logo}
                  alt="logo"
                  style={{ maxHeight: '40px' }}
                />
              ) : (
                <Button variant="contained" color="primary">
                  上传图片
                </Button>
              )}
            </Upload>
          </Grid>
          <Grid item xs={5}>
            <Button color="secondary" onClick={onDeleteLogoClick}>
              删除图片
            </Button>
          </Grid>
        </Grid>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="chatTitle"
          name="chatTitle"
          label="自定义聊天标题"
          value={chatUIConfigObj?.navbar?.title || ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TitleIcon />
              </InputAdornment>
            ),
          }}
          onChange={handleTitleChange}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          id="chatTitle"
          name="chatTitle"
          label="欢迎语设置"
          value={(chatUIConfigObj?.messages ?? [])[0]?.content?.text || ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TitleIcon />
              </InputAdornment>
            ),
          }}
          onChange={handleWelcomeMessageChange}
        />
        <Grid container>
          <Grid item xs={7}>
            <Upload {...avatarUploadProps}>
              <Typography variant="body1">
                客服头像设置 (最大 108 * 108，点击头像或上传添加/修改)
              </Typography>
              {chatUIConfigObj && chatUIConfigObj.robot?.avatar ? (
                <img
                  src={chatUIConfigObj.robot.avatar}
                  alt="logo"
                  style={{ maxHeight: '40px' }}
                />
              ) : (
                <Button variant="contained" color="primary">
                  上传图片
                </Button>
              )}
            </Upload>
          </Grid>
          <Grid item xs={5}>
            <Button color="secondary" onClick={onDeleteAvatarClick}>
              删除图片
            </Button>
          </Grid>
        </Grid>
        <FormControl variant="outlined" margin="normal" fullWidth>
          <InputLabel id="demo-mutiple-chip-label">热门问题</InputLabel>
          <Select
            labelId="demo-mutiple-chip-label"
            id="demo-mutiple-chip"
            multiple
            input={<Input id="select-multiple-chip" />}
            onChange={handleConnectIdChange}
            value={chatUIConfigObj?.connectIds ?? []}
            label="热门问题"
            renderValue={(selected) => (
              <div className={classes.chips}>
                {(selected as string[]).map((id) => (
                  <Chip
                    key={id}
                    label={
                      allTopic?.allTopic
                        ?.filter((topic) => topic.id === id)
                        ?.map((topic) => topic.question)[0] ?? ''
                    }
                    className={classes.chip}
                    onDelete={() => {
                      handleConnectIdDelete(id);
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
            {allTopic?.allTopic &&
              allTopic.allTopic.map((topic) => (
                <MenuItem
                  key={topic.id}
                  value={topic.id}
                  style={getStyles(
                    topic.id ?? '',
                    chatUIConfigObj?.connectIds ?? [],
                    theme
                  )}
                >
                  {topic.question}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <div className={classes.root}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1c-content"
              id="panel1c-header"
            >
              <div className={classes.column}>
                <Typography className={classes.heading}>设置客服</Typography>
              </div>
              <div className={classes.column}>
                <Typography className={classes.secondaryHeading}>
                  选择要加入此接待组的客服和优先级
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <Grid container spacing={4}>
                <Grid item sm={6} xs={12}>
                  <Typography variant="caption">机器人客服</Typography>
                  {tempStaffConfig &&
                    tempStaffConfig
                      .filter((sc) => sc.staffType === 0)
                      .map((sc) => createStaffConfigList(sc))}
                </Grid>
                <Grid item sm={6} xs={12} className={classes.helper}>
                  <Typography variant="caption">人工客服</Typography>
                  {tempStaffConfig &&
                    tempStaffConfig
                      .filter((sc) => sc.staffType === 1)
                      .map((sc) => createStaffConfigList(sc))}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </div>
        <Typography variant="h6" gutterBottom>
          配置ChatUI界面
          <Link
            target="_blank"
            href="https://chatui.io/sdk/config-ui"
            variant="body2"
            color="textPrimary"
            style={{ marginLeft: 10 }}
          >
            查看ChatUI配置文档（推荐开发进行配置）
          </Link>
        </Typography>
        <div ref={jsoneditorRef} style={{ height: '500px' }} />
        <SubmitButton />
      </form>
    </div>
  );
}
