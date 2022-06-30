/* eslint-disable react/jsx-props-no-spreading */
import { useSelector } from 'react-redux';
import { Typography } from '@material-ui/core';
import Upload, { UploadProps } from 'rc-upload';
import clientConfig from 'renderer/config/clientConfig';
import { getStaffToken } from 'renderer/state/staff/staffAction';
import useAlert from 'renderer/hook/alert/useAlert';

interface FormProps {
  knowledgeBaseId: number;
  onSuccess: () => void;
}
export default function BotTopicUploadForm(props: FormProps) {
  const { knowledgeBaseId, onSuccess } = props;
  const token = useSelector(getStaffToken);
  const { onCompletedMsg, onLoadding, onErrorMsg } = useAlert();

  const uploaderProps: UploadProps = {
    action: `${clientConfig.web.host}/import/topic`,
    data: { knowledgeBaseId },
    multiple: false,
    accept: '.xlsx',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onStart: (file) => {
      onLoadding(true);
      console.log('onStart', file.name);
    },
    onSuccess(file) {
      console.log('onSuccess', file);
      onSuccess();
      onCompletedMsg('导入成功');
    },
    onProgress(step, file) {
      onLoadding(true);
      console.log('onProgress', Math.round(step.percent!), file.name);
    },
    onError(err) {
      onErrorMsg('导入失败');
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
