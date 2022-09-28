import { useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { debounceTime, Subject } from 'rxjs';
import { useTranslation } from 'react-i18next';

import { setSnackbarProp } from 'renderer/state/chat/chatAction';
import { ApolloError } from '@apollo/client';
import { SnackbarProp } from 'renderer/domain/Chat';

interface Result {
  onLoadding: (loadding?: boolean) => void;
  onCompleted: () => void;
  onCompletedMsg: (message: string) => void;
  onError: (error: ApolloError) => void;
  onErrorMsg: (message: string) => void;
}

/**
 * 提供统一的数据操作反馈
 *
 */
const useAlert = (): Result => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const subjectSearchText = useMemo(() => {
    // 提供一定的延迟，防止同时刷新不同 UI 组件
    // see https://stackoverflow.com/questions/62336340/cannot-update-a-component-while-rendering-a-different-component-warning
    return new Subject<SnackbarProp>();
  }, []);

  const momeSubject = useMemo(() => {
    return subjectSearchText.pipe(debounceTime(200)).subscribe({
      next: (it) => {
        dispatch(setSnackbarProp(it));
      },
    });
  }, [dispatch, subjectSearchText]);

  const onLoadding = (loadding?: boolean) => {
    subjectSearchText.next({
      open: Boolean(loadding),
      loadding,
      autoHideDuration: undefined,
    });
  };
  const onCompletedMsg = (message?: string) => {
    subjectSearchText.next({
      open: true,
      message: message ?? 'Success',
      severity: 'success',
      autoHideDuration: 6000,
    });
  };
  const onCompleted = () => onCompletedMsg();
  const onErrorMsg = (message?: string) => {
    subjectSearchText.next({
      open: true,
      message: message ?? 'Fail',
      severity: 'error',
      autoHideDuration: 6000,
    });
  };

  const onError = (error: ApolloError) =>
    onErrorMsg(`${t('Error')}: ${error.message}`);

  useEffect(() => {
    return () => {
      momeSubject.unsubscribe();
    };
  }, [momeSubject]);

  return {
    onLoadding,
    onCompleted,
    onCompletedMsg,
    onError,
    onErrorMsg,
  };
};

export default useAlert;
