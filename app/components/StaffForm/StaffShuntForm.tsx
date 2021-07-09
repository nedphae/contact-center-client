import React, { useEffect, useRef, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import GroupIcon from '@material-ui/icons/Group';
import { Typography, CircularProgress, Link } from '@material-ui/core';

import { StaffShunt } from 'app/domain/StaffInfo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { ShuntUIConfig } from 'app/domain/Config';

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
  defaultValues: StaffShunt | undefined;
}

interface Graphql {
  saveStaffShunt: StaffShunt | undefined;
}
interface ChatUIConfigGraphql {
  saveChatUIConfig: ShuntUIConfig | undefined;
}

const MUTATION_STAFF_SHUNT = gql`
  mutation StaffShunt($staffShuntInput: StaffShuntInput!) {
    saveStaffShunt(staffShunt: $staffShuntInput) {
      id
      organizationId
      shuntClassId
      name
      code
    }
  }
`;

const MUTATION_UICONFIG = gql`
  mutation ChatUIConfig($shuntUIConfigInput: ShuntUIConfigInput!) {
    saveChatUIConfig(uiConfig: $shuntUIConfigInput) {
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

interface ChatUIConfigGraphql {
  chatUIConfig: ShuntUIConfig | undefined;
}

export default function StaffShuntForm(props: FormProps) {
  const { defaultValues } = props;
  const classes = useStyles();
  const jsoneditorRef = useRef<HTMLDivElement>(null);
  const [jsoneditor, setJsoneditor] = useState<JSONEditor | null>(null);
  const { handleSubmit, register } = useForm<StaffShunt>({
    defaultValues,
  });

  const [saveStaffShunt, { loading, data }] =
    useMutation<Graphql>(MUTATION_STAFF_SHUNT);
  const [saveChatUIConfig, { data: savedChatUIConfig }] =
    useMutation<ChatUIConfigGraphql>(MUTATION_UICONFIG);
  const [getChatUIConfig, { data: chatUIConfig }] =
    useLazyQuery<ChatUIConfigGraphql>(QUERY_CHATUI_CONFIG, {
      variables: { shuntId: defaultValues?.id },
    });

  useEffect(() => {
    if (defaultValues && defaultValues.id) {
      getChatUIConfig();
    }
    const options: JSONEditorOptions = {
      mode: 'tree',
    };
    if (jsoneditorRef.current) {
      setJsoneditor(new JSONEditor(jsoneditorRef.current, options));
    }
    return () => {
      if (jsoneditor) {
        jsoneditor.destroy();
      }
    };
  }, [defaultValues, getChatUIConfig, jsoneditor]);

  useEffect(() => {
    if (jsoneditorRef.current && jsoneditor) {
      if (
        chatUIConfig &&
        chatUIConfig.chatUIConfig &&
        chatUIConfig.chatUIConfig.config
      ) {
        jsoneditor.updateText(chatUIConfig.chatUIConfig.config);
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

  const onSubmit: SubmitHandler<StaffShunt> = async (form) => {
    const shuntResult = await saveStaffShunt({
      variables: { staffShuntInput: form },
    });
    if (shuntResult.data && shuntResult.data.saveStaffShunt) {
      const shuntUIConfigInput: ShuntUIConfig = {
        shuntId: shuntResult.data.saveStaffShunt.id,
        config: jsoneditor?.getText(),
      };
      saveChatUIConfig({
        variables: { shuntUIConfigInput },
      });
    }
  };

  return (
    <div className={classes.paper}>
      {loading && <CircularProgress />}
      {data && <Typography>Success!</Typography>}
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveStaffShunt?.id || ''}
          name="id"
          type="hidden"
          inputRef={register({ maxLength: 100, valueAsNumber: true })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          name="name"
          label="接待组名称"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          inputRef={register({
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
          name="code"
          label="接待组链接代码"
          value={defaultValues?.code || data?.saveStaffShunt?.code || ''}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          inputRef={register()}
        />
        <Typography variant="h5" gutterBottom>
          配置ChatUI界面
          <Link href="https://chatui.io/sdk/config-ui" variant="body2">
            查看ChatUI配置文档（推荐开发进行配置）
          </Link>
        </Typography>
        <div ref={jsoneditorRef} />
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
