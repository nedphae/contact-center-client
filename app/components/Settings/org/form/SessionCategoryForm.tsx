import React, { useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { FormControl, TextField } from '@material-ui/core';
import { useMutation } from '@apollo/client';
import SubmitButton from 'app/components/Form/SubmitButton';
import { SessionCategory } from 'app/domain/SessionCategory';
import DropdownTreeSelect, { TreeNodeProps } from 'react-dropdown-tree-select';
import 'app/assets/css/DropdownTreeSelect.global.css';
import {
  SaveSessionCategoryGraphql,
  MUTATION_SAVE_SESSION_CATEGORY,
} from 'app/domain/graphql/SessionCategory';
import useAlert from 'app/hook/alert/useAlert';

interface SessionCategoryFormProps {
  defaultValues: SessionCategory | undefined;
  treeNodeProps: TreeNodeProps[];
  refetch: () => void;
}

export default function SessionCategoryForm(props: SessionCategoryFormProps) {
  const { defaultValues, treeNodeProps, refetch } = props;
  const { handleSubmit, register, setValue, errors } = useForm<SessionCategory>(
    {
      defaultValues,
    }
  );

  const { onLoadding, onCompleted, onError } = useAlert();
  const [saveSessionCategory, { loading, data }] =
    useMutation<SaveSessionCategoryGraphql>(MUTATION_SAVE_SESSION_CATEGORY, {
      onCompleted,
      onError,
    });
  if (loading) {
    onLoadding(loading);
  }

  const onSubmit: SubmitHandler<SessionCategory> = async (form) => {
    await saveSessionCategory({ variables: { sessionCategoryList: [form] } });
    refetch();
  };

  const dropdownTreeSelect = useMemo(() => {
    return (
      <DropdownTreeSelect
        inlineSearchInput
        data={treeNodeProps}
        onChange={(_currentNode, selectedNodes) => {
          const value = selectedNodes.map((it) => it.value)[0];
          setValue('parentCategory', value);
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
        name="id"
        type="hidden"
        inputRef={register({ valueAsNumber: true })}
      />
      <TextField
        defaultValue={defaultValues?.enabled || true}
        name="enabled"
        type="hidden"
        inputRef={register()}
      />
      <TextField
        defaultValue={
          data?.saveSessionCategory[0].parentCategory ||
          defaultValues?.parentCategory ||
          ''
        }
        name="parentCategory"
        type="hidden"
        error={errors.parentCategory && true}
        helperText={errors.parentCategory?.message}
        inputRef={register({
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
        name="categoryName"
        label="咨询类型名称"
        error={errors.categoryName && true}
        helperText={errors.categoryName?.message}
        inputRef={register({
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
