import React, { useMemo, useRef, useState } from 'react';

import _ from 'lodash';
import { gql, useMutation, useQuery } from '@apollo/client';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { Topic, BotConfig, KnowledgeBase, TopicCategory } from 'app/domain/Bot';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridSelectionModelChangeParams,
} from '@material-ui/data-grid';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import TopicForm from 'app/components/Bot/TopicForm';
import BotSidecar from 'app/components/Bot/BotSidecar';
import 'app/components/Bot/DropdownTreeSelect.global.css';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
    },
  })
);

interface Graphql {
  allTopic: Topic[];
  allBotConfig: BotConfig[];
  allKnowledgeBase: KnowledgeBase[];
  allTopicCategory: TopicCategory[];
}

const QUERY = gql`
  query Bot {
    allTopic {
      id
      knowledgeBaseId
      question
      md5
      answer
      innerAnswer
      fromType
      type
      refId
      connectIds
      enabled
      effectiveTime
      failureTime
      categoryId
      faqType
    }
    allBotConfig {
      id
      botId
      knowledgeBaseId
      noAnswerReply
    }
    allKnowledgeBase {
      id
      name
      description
    }
    allTopicCategory {
      id
      knowledgeBaseId
      name
      pid
    }
  }
`;

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'knowledgeBaseId', headerName: '所属知识库ID', width: 150 },
  { field: 'question', headerName: '问题', width: 150 },
  { field: 'md5', headerName: '问题的md5', width: 150 },
  { field: 'answer', headerName: '问题的对外答案', width: 150 },
  { field: 'innerAnswer', headerName: '问题的对内答案', width: 150 },
  { field: 'fromType', headerName: '问题的来源', width: 150 },
  { field: 'type', headerName: '问题类型', width: 150 },
  { field: 'refId', headerName: '相似问题', width: 150 },
  { field: 'enabled', headerName: '是否有效标记位', width: 150 },
  { field: 'effectiveTime', headerName: '问题的有效时间', width: 150 },
  { field: 'failureTime', headerName: '有效期结束', width: 150 },
  { field: 'categoryId', headerName: '知识点所属分类', width: 150 },
];

const MUTATION_TOPIC = gql`
  mutation DeleteTopic($ids: [String!]!) {
    deleteTopicByIds(ids: $ids)
  }
`;

export default function Bot() {
  const classes = useStyles();
  const refOfTopicDialog = useRef<DraggableDialogRef>(null);
  const [topic, setTopic] = useState<Topic | undefined>(undefined);
  const { data, loading, refetch } = useQuery<Graphql>(QUERY);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [deleteTopicById] = useMutation<unknown>(MUTATION_TOPIC);

  const handleClickOpen = (selectTopic: Topic) => {
    setTopic(selectTopic);
    refOfTopicDialog.current?.setOpen(true);
  };

  function newButtonClick() {
    setTopic(undefined);
    refOfTopicDialog.current?.setOpen(true);
  }

  function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      deleteTopicById({ variables: { ids: selectionModel } });
    }
  }

  const memoData = useMemo(() => {
    // useMemo 优化一下
    const botConfigMap = _.groupBy(data?.allBotConfig, 'knowledgeBaseId');

    const topicCategoryPidGroup = _.groupBy(
      data?.allTopicCategory,
      (it) => it.pid ?? -2
    );
    const topicCategoryGroup = _.groupBy(data?.allTopic, 'categoryId');
    const pTopicCategory = data?.allTopicCategory
      .map((it) => {
        return _.assignIn(
          {
            topicList: topicCategoryGroup[it.id ?? -1],
            children: topicCategoryPidGroup[it.id ?? -1],
          },
          it
        );
      })
      .filter((it) => it.pid === undefined || it.pid === null);

    const topicCategoryKnowledgeBaseGroup = _.groupBy(
      pTopicCategory,
      'knowledgeBaseId'
    );
    const memoAllKnowledgeBase =
      data?.allKnowledgeBase.map((it) => {
        const [botConfig] = it.id ? botConfigMap[it.id] ?? [] : [];
        const knowledgeBase = _.assignIn(
          {
            categoryList: topicCategoryKnowledgeBaseGroup[it.id ?? -1],
            botConfig,
          },
          it
        );
        return knowledgeBase as KnowledgeBase;
      }) ?? [];

    return {
      allKnowledgeBase: memoAllKnowledgeBase,
      botConfigMap,
    };
  }, [data]);

  const rows = data?.allTopic ?? [];

  return (
    <>
      {/* 显示 DataGrid Topic */}
      <DraggableDialog title="配置知识库问题" ref={refOfTopicDialog}>
        <TopicForm
          defaultValues={topic}
          topicList={rows}
          categoryList={data?.allTopicCategory ?? []}
        />
      </DraggableDialog>
      <Grid container className={classes.root}>
        <BotSidecar
          memoData={memoData}
          allTopicCategory={data?.allTopicCategory}
          refetch={refetch}
        />
        <Grid item xs={12} sm={10}>
          <DataGrid
            localeText={GRID_DEFAULT_LOCALE_TEXT}
            rows={rows}
            columns={columns}
            components={{
              Toolbar: CustomerGridToolbarCreater({
                newButtonClick,
                deleteButtonClick,
                refetch: () => {
                  refetch();
                },
              }),
            }}
            onRowClick={(param) => {
              handleClickOpen(param.row as Topic);
            }}
            pagination
            pageSize={20}
            loading={loading}
            disableSelectionOnClick
            checkboxSelection
            onSelectionModelChange={(
              newSelectionModel: GridSelectionModelChangeParams
            ) => {
              setSelectionModel(newSelectionModel.selectionModel);
            }}
            selectionModel={selectionModel}
          />
        </Grid>
      </Grid>
    </>
  );
}
