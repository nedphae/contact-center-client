import React, { useMemo } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import {
  CircularProgress,
  FormControl,
  InputLabel,
  Typography,
} from '@material-ui/core';
import DropdownTreeSelect, { TreeNodeProps } from 'react-dropdown-tree-select';

import { TopicCategory } from 'app/domain/Bot';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    formControl: {
      margin: theme.spacing(1),
      width: '100%', // Fix IE 11 issue.
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  })
);

interface FormProps {
  defaultValues: TopicCategory | undefined;
  allTopicCategoryList: TopicCategory[];
}

interface Graphql {
  saveTopicCategory: TopicCategory;
}

const MUTATION = gql`
  mutation TopicCategory($topicCategoryInput: TopicCategoryInput!) {
    saveTopicCategory(topicCategory: $topicCategoryInput) {
      id
      name
      knowledgeBaseId
      pid
    }
  }
`;

function makeTreeNode(
  topicCategory: TopicCategory[],
  selectValue?: number
): TreeNodeProps[] {
  return topicCategory.map((it) => {
    const node: TreeNodeProps = {
      label: it.name,
      value: it.id?.toString() ?? '',
    };
    if (selectValue && it.id === selectValue) {
      node.isisDefaultValue = true;
    }
    if (it.children) {
      node.children = makeTreeNode(it.children, selectValue);
    }
    return node;
  });
}

export default function TopicCategoryForm(props: FormProps) {
  const { defaultValues, allTopicCategoryList } = props;
  const classes = useStyles();
  const { handleSubmit, register, errors, control } = useForm<TopicCategory>({
    defaultValues,
  });

  const [saveTopicCategory, { loading, data }] = useMutation<Graphql>(MUTATION);

  const onSubmit: SubmitHandler<TopicCategory> = (form) => {
    saveTopicCategory({ variables: { topicCategoryInput: form } });
  };

  const treeData = useMemo(
    () => makeTreeNode(allTopicCategoryList, defaultValues?.pid),
    [defaultValues, allTopicCategoryList]
  );

  return (
    <div className={classes.paper}>
      {loading && <CircularProgress />}
      {data && <Typography>Success!</Typography>}
      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          value={defaultValues?.id || data?.saveTopicCategory.id || ''}
          name="id"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <TextField
          value={
            defaultValues?.knowledgeBaseId ||
            data?.saveTopicCategory.knowledgeBaseId ||
            ''
          }
          name="knowledgeBaseId"
          type="hidden"
          inputRef={register({ valueAsNumber: true })}
        />
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="demo-mutiple-chip-label">上级分类</InputLabel>
          <Controller
            control={control}
            name="pid"
            render={({ onChange }) => (
              <DropdownTreeSelect
                data={treeData}
                onChange={(_currentNode, selectedNodes) => {
                  onChange(selectedNodes.map((it) => it.value)[0]);
                }}
                className="mdl-demo"
                mode="radioSelect"
              />
            )}
          />
        </FormControl>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          name="name"
          label="分类名称"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QuestionAnswerIcon />
              </InputAdornment>
            ),
          }}
          error={errors.name && true}
          helperText={errors.name}
          inputRef={register({
            maxLength: {
              value: 500,
              message: '分类名称 长度不能大于500个字符',
            },
          })}
        />
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
