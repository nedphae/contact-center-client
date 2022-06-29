/* eslint-disable react/jsx-props-no-spreading */
import { Typography } from '@material-ui/core';
import Upload, { UploadProps } from 'rc-upload';
import clientConfig from 'renderer/config/clientConfig';

interface FormProps {
  knowledgeBaseId: number;
}
export default function BotTopicUploadForm(props: FormProps) {
  const { knowledgeBaseId } = props;

  const uploaderProps: UploadProps = {
    action: `${clientConfig.web.host}${clientConfig.s3.path}/import/topic`,
    data: { knowledgeBaseId },
    directory: true,
    onStart: (file) => {
      console.log('onStart', file.name);
    },
    onSuccess(file) {
      console.log('onSuccess', file);
    },
    onProgress(step, file) {
      console.log('onProgress', Math.round(step.percent!), file.name);
    },
    onError(err) {
      console.log('onError', err);
    },
  };
  return (
    <div
      style={{
        margin: 100,
      }}
    >
      <div>
        <Upload {...uploaderProps}>
          <Typography variant="body1">点击上传知识库 Excel 文件</Typography>
        </Upload>
      </div>
    </div>
  );
}
