/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// import '@wangeditor/editor/dist/css/style.css';
import './wangeditor.global.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { IDomEditor, IEditorConfig } from '@wangeditor/editor';
import {
  getDownloadS3ChatImgPath,
  getUploadS3ChatPath,
} from 'renderer/config/clientConfig';
import useAlert from 'renderer/hook/alert/useAlert';

interface RichTextProps {
  html: string;
  setHtml: React.Dispatch<IDomEditor>;
}

type InsertFnType = (url: string, alt: string, href: string) => void;

export default function RichText(props: RichTextProps) {
  const { html, setHtml } = props; // 编辑器内容
  const { t } = useTranslation();

  const [editor, setEditor] = useState<IDomEditor | null>(null); // 存储 editor 实例
  const { onErrorMsg } = useAlert();

  const toolbarConfig = {};
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: t('placeholder'),
    MENU_CONF: {},
  };

  if (editorConfig.MENU_CONF) {
    editorConfig.MENU_CONF.uploadImage = {
      server: getUploadS3ChatPath(),
      fieldName: 'file',

      // 单个文件的最大体积限制，默认为 2M
      maxFileSize: 2 * 1024 * 1024, // 1M

      // 最多可上传几个文件，默认为 100
      maxNumberOfFiles: 10,

      // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
      allowedFileTypes: ['image/*'],

      // 超时时间，默认为 10 秒
      timeout: 5 * 1000, // 5 秒

      // 小于该值就插入 base64 格式（而不上传），默认为 0
      // base64LimitSize: 5 * 1024,

      // 自定义插入图片
      customInsert(res: any, insertFn: InsertFnType) {
        // res 即服务端的返回结果
        (res as string[]).forEach((url: string) => {
          const filename = url.split('/').pop();
          // 从 res 中找到 url alt href ，然后插图图片
          insertFn(
            `${getDownloadS3ChatImgPath()}${url}`,
            filename ?? '',
            `${getDownloadS3ChatImgPath()}${url}`
          );
        });
      },

      // 上传错误，或者触发 timeout 超时
      onError(file: File, err: any, res: any) {
        onErrorMsg('Upload failed');
      },
    };
    editorConfig.MENU_CONF.uploadVideo = {
      server: getUploadS3ChatPath(),
      fieldName: 'file',

      // 单个文件的最大体积限制，默认为 10M
      maxFileSize: 5 * 1024 * 1024, // 5M

      // 最多可上传几个文件，默认为 5
      maxNumberOfFiles: 3,

      // 选择文件时的类型限制，默认为 ['video/*'] 。如不想限制，则设置为 []
      allowedFileTypes: ['video/*'],

      // 超时时间，默认为 10 秒
      timeout: 5 * 1000, // 5 秒

      // 自定义插入图片
      customInsert(res: any, insertFn: InsertFnType) {
        // res 即服务端的返回结果
        (res as string[]).forEach((url: string) => {
          const filename = url.split('/').pop();
          // 从 res 中找到 url alt href ，然后插图图片
          insertFn(
            `${getDownloadS3ChatImgPath()}${url}`,
            filename ?? '',
            `${getDownloadS3ChatImgPath()}${url}`
          );
        });
      },

      // 上传错误，或者触发 timeout 超时
      onError(file: File, err: any, res: any) {
        onErrorMsg('Upload failed');
      },
    };
  }

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #ccc' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={(e) => setHtml(e)}
        mode="default"
        style={{ height: '500px', overflowY: 'hidden' }}
      />
    </>
  );
}
