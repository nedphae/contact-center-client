import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Id, toast } from 'react-toastify';

import { ApolloError } from '@apollo/client';

interface Result {
  onLoadding: (message: string) => void;
  onCompleted: () => void;
  onCompletedMsg: (message: string) => void;
  onError: (error: ApolloError) => void;
  onErrorMsg: (message: string) => void;
}

const resetParams = {
  isLoading: null,
  autoClose: null,
  closeOnClick: null,
  closeButton: null,
  draggable: null,
  delay: 100,
};

/**
 * 提供统一的数据操作反馈
 *
 */
const useAlert = (): Result => {
  const toastId = useRef<Id>();
  const { t } = useTranslation();

  const onLoadding = (message: string) => {
    const msg = t(message);
    if (toastId.current) {
      toast.update(toastId.current, {
        render: msg,
        isLoading: true,
        type: toast.TYPE.DEFAULT,
      });
    } else {
      toastId.current = toast.loading(msg);
    }
  };
  const onCompletedMsg = (message?: string) => {
    const msg = t(message ?? 'Success');
    if (toastId.current) {
      toast.update(toastId.current, {
        type: toast.TYPE.SUCCESS,
        render: msg,
        ...resetParams,
        autoClose: 5000,
      });
    } else {
      toastId.current = toast.success(msg);
    }
  };
  const onCompleted = () => onCompletedMsg();
  const onErrorMsg = (message?: string) => {
    const msg = t(message ?? 'Fail');
    if (toastId.current) {
      toast.update(toastId.current, {
        type: toast.TYPE.ERROR,
        render: msg,
        ...resetParams,
        autoClose: 5000,
      });
    } else {
      toastId.current = toast.error(msg);
    }
  };

  const onError = (error: ApolloError) =>
    onErrorMsg(`${t('Error')}: ${error.message}`);

  return {
    onLoadding,
    onCompleted,
    onCompletedMsg,
    onError,
    onErrorMsg,
  };
};

export default useAlert;
