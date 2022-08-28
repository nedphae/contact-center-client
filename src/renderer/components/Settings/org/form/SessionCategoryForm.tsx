/* eslint-disable react/jsx-props-no-spreading */
import { useMemo } from 'react';
import _ from 'lodash';
import { Object } from 'ts-toolbelt';
import { useForm, SubmitHandler } from 'react-hook-form';

import { FormControl, TextField } from '@material-ui/core';
import { useMutation } from '@apollo/client';
import SubmitButton from 'renderer/components/Form/SubmitButton';
import { SessionCategory } from 'renderer/domain/SessionCategory';
import DropdownTreeSelect, { TreeNodeProps } from 'react-dropdown-tree-select';
import 'renderer/assets/css/DropdownTreeSelect.global.css';
import {
  SaveSessionCategoryGraphql,
  MUTATION_SAVE_SESSION_CATEGORY,
} from 'renderer/domain/graphql/SessionCategory';
import useAlert from 'renderer/hook/alert/useAlert';

// 去除掉没用的循环属性
type FormType = Object.Omit<SessionCategory, 'children' | 'parentCategoryItem'>;

interface SessionCategoryFormProps {
  defaultValues: FormType | undefined;
  treeNodeProps: TreeNodeProps[];
  refetch: () => void;
}

export default function SessionCategoryForm(props: SessionCategoryFormProps) {
  const { defaultValues, treeNodeProps, refetch } = props;
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues,
    shouldUnregister: true,
  });

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveSessionCategory, { loading, data }] =
    useMutation<SaveSessionCategoryGraphql>(MUTATION_SAVE_SESSION_CATEGORY, {
      onCompleted,
      onError,
    });
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<FormType> = async (form) => {
    await saveSessionCategory({
      variables: { sessionCategoryList: [_.omit(form, '__typename')] },
    });
    refetch();
  };

  const dropdownTreeSelect = useMemo(() => {
    return (
      <DropdownTreeSelect
        inlineSearchInput
        data={treeNodeProps}
        onChange={(_currentNode, selectedNodes) => {
          const value = selectedNodes.map((it) => it.value)[0];
          setValue('parentCategory', +value);
        }}
        texts={{ placeholder: '选择咨询类型所属父类' }}
        className="mdl-demo"
        mode="radioSelect"
      />
    );
  }, [setValue, treeNodeProps]);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <TextField
        defaultValue={defaultValues?.id || ''}
        type="hidden"
        {...register('id', { valueAsNumber: true })}
      />
      <TextField
        defaultValue={defaultValues?.enabled || true}
        type="hidden"
        {...register('enabled')}
      />
      <TextField
        defaultValue={
          data?.saveSessionCategory[0].parentCategory ||
          defaultValues?.parentCategory ||
          ''
        }
        type="hidden"
        error={errors.parentCategory && true}
        helperText={errors.parentCategory?.message}
        {...register('parentCategory', {
          valueAsNumber: true,
        })}
      />
      <FormControl variant="outlined" margin="normal" fullWidth>
        {dropdownTreeSelect}
      </FormControl>
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        autoFocus
        id="categoryName"
        label="咨询类型名称"
        error={errors.categoryName && true}
        helperText={errors.categoryName?.message}
        {...register('categoryName', {
          required: true,
          maxLength: {
            value: 50,
            message: '咨询类型名称长度不能大于50个字符',
          },
        })}
      />
      <SubmitButton />
    </form>
  );
}
