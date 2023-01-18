/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
      onLoadding('Uploading');
    },
    onSuccess(file) {
      onSuccess();
      onCompletedMsg('Import Success');
    },
    onProgress(step, file) {
      onLoadding('Uploading');
    },
    onError(err) {
      onErrorMsg('Import Error');
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
          <Typography variant="body1">
            {t('Click to upload knowledge base Excel file')}
          </Typography>
        </Upload>
      </div>
    </div>
  );
}
