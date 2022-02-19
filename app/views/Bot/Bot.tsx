import React, { useCallback, useMemo, useRef, useState } from 'react';

import _ from 'lodash';
import { gql, useMutation, useQuery } from '@apollo/client';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import {
  Topic,
  BotConfig,
  KnowledgeBase,
  TopicCategory,
  Answer,
} from 'app/domain/Bot';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetterParams,
} from '@material-ui/data-grid';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import TopicForm from 'app/components/Bot/TopicForm';
import BotSidecar from 'app/components/Bot/BotSidecar';
import 'app/assets/css/DropdownTreeSelect.global.css';
import useAlert from 'app/hook/alert/useAlert';
import { PageParam } from 'app/domain/graphql/Query';
import { TopicFilterInput } from 'app/domain/graphql/Bot';
import TopicSearchFrom from 'app/components/Bot/TopicSearchForm';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
    },
  })
);

interface BotGraphql {
  allBotConfig: BotConfig[];
  allKnowledgeBase: KnowledgeBase[];
  allTopicCategory: TopicCategory[];
}

interface TopicGraphql {
  searchTopic: Topic[];
}

const QUERY_TOPIC = gql`
  query Topic($topicFilterInput: TopicFilterInput!) {
    searchTopic(topicFilter: $topicFilterInput) {
      id
      knowledgeBaseId
      question
      md5
      answer {
        type
        content
      }
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
  }
`;

const QUERY_BOTS = gql`
  query Bot {
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
  { field: 'id', headerName: 'ID', width: 200 },
  { field: 'knowledgeBaseName', headerName: '所属知识库', width: 200 },
  { field: 'categoryName', headerName: '知识点所属分类', width: 200 },
  { field: 'question', headerName: '问题', width: 250 },
  {
    field: 'answer',
    headerName: '问题的对外答案',
    width: 250,
    valueGetter: (params: GridValueGetterParams) => {
      const answer = params.value as Answer[] | undefined;
      return answer && answer[0]?.content;
    },
  },
  { field: 'innerAnswer', headerName: '问题的对内答案', width: 250 },
  {
    field: 'fromType',
    headerName: '问题的来源',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '其他';
      switch (params.value) {
        case 0: {
          result = '用户手动添加';
          break;
        }
        case 1: {
          result = '文件导入';
          break;
        }
        default: {
          break;
        }
      }
      return result;
    },
  },
  {
    field: 'type',
    headerName: '问题类型',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '其他';
      switch (params.value) {
        case 1: {
          result = '标准问题';
          break;
        }
        case 2: {
          result = '相似问题';
          break;
        }
        default: {
          break;
        }
      }
      return result;
    },
  },
  { field: 'refQuestion', headerName: '指向的相似问题', width: 250 },
  {
    field: 'enabled',
    headerName: '是否有效标记位',
    width: 150,
    type: 'boolean',
  },
  { field: 'effectiveTime', headerName: '问题的有效时间', width: 200 },
  { field: 'failureTime', headerName: '有效期结束', width: 150 },
  { field: 'md5', headerName: '问题的md5', width: 150 },
];

const MUTATION_TOPIC = gql`
  mutation DeleteTopic($ids: [String!]!) {
    deleteTopicByIds(ids: $ids)
  }
`;

const defaultValue: TopicFilterInput = {};

export default function Bot() {
  const classes = useStyles();
  const refOfTopicDialog = useRef<DraggableDialogRef>(null);
  const [topic, setTopic] = useState<Topic>();
  const [topicFilterInput, setTopicFilterInput] =
    useState<TopicFilterInput>(defaultValue);
  const { data, loading, refetch } = useQuery<BotGraphql>(QUERY_BOTS);
  const { data: topicData, refetch: refetchTopic } = useQuery<TopicGraphql>(
    QUERY_TOPIC,
    {
      variables: { topicFilterInput },
    }
  );
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  const [selectTopicCategory, setSelectTopicCategory] = useState<number[]>();

  const { onLoadding, onCompleted, onError } = useAlert();
  const [deleteTopicById, { loading: deleteLoading }] = useMutation<unknown>(
    MUTATION_TOPIC,
    {
      onCompleted,
      onError,
    }
  );
  if (deleteLoading) {
    onLoadding(deleteLoading);
  }

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
    // 生成各种需要的Map, 根据 ID 填充名称
    const allTopicCategory = _.cloneDeep(data?.allTopicCategory ?? []);
    const allBotConfig = _.cloneDeep(data?.allBotConfig ?? []);
    const allKnowledgeBase = _.cloneDeep(data?.allKnowledgeBase ?? []);
    const memoAllTopic = _.cloneDeep(topicData?.searchTopic ?? []);
    const botConfigMap = _.groupBy(allBotConfig, 'knowledgeBaseId');

    const allKnowledgeBaseMap = _.groupBy(allKnowledgeBase, 'id');
    const allTopicCategoryMap = _.groupBy(allTopicCategory, 'id');
    const memoAllTopicMap = _.groupBy(memoAllTopic, 'id');

    const topicCategoryPidGroup = _.groupBy(allTopicCategory, (it) => it.pid);
    const topicCategoryGroup = _.groupBy(topicData?.searchTopic, 'categoryId');

    const pTopicCategory = allTopicCategory
      .map((it) => {
        it.children = topicCategoryPidGroup[it.id ?? -1];
        it.topicList = topicCategoryGroup[it.id ?? -1];
        return it;
      })
      .filter((it) => it.pid === undefined || it.pid === null);

    const topicCategoryKnowledgeBaseGroup = _.groupBy(
      pTopicCategory,
      'knowledgeBaseId'
    );
    const memoAllKnowledgeBase = allKnowledgeBase.map((it) => {
      const [botConfig] = it.id ? botConfigMap[it.id] ?? [] : [];
      it.categoryList = topicCategoryKnowledgeBaseGroup[it.id ?? -1];
      it.botConfig = botConfig;
      return it;
    });

    memoAllTopic.forEach((it) => {
      if (it.categoryId && it.knowledgeBaseId) {
        it.categoryName = allTopicCategoryMap[it.categoryId.toString()][0].name;
        it.knowledgeBaseName =
          allKnowledgeBaseMap[it.knowledgeBaseId.toString()][0].name;
      }
      if (it.type === 2 && it.refId) {
        it.refQuestion = memoAllTopicMap[it.refId][0].question;
      }
    });

    return {
      allKnowledgeBase: memoAllKnowledgeBase,
      botConfigMap,
      allTopicCategory: pTopicCategory,
      memoAllTopic,
    };
  }, [data, topicData]);

  const onTopicCategoryClick = useCallback(
    (clickTopicCategory?: TopicCategory) => {
      function getAllTopicCategoryIds(
        topicCategory?: TopicCategory
      ): number[] | undefined {
        if (topicCategory) {
          const ids: number[] = [];
          if (topicCategory.children) {
            topicCategory.children.forEach((it) => {
              const cids = getAllTopicCategoryIds(it);
              if (cids) {
                ids.push(...cids);
              }
            });
          }
          if (topicCategory.id) {
            ids.push(topicCategory.id);
          }
          return ids;
        }
        return undefined;
      }

      const ids = getAllTopicCategoryIds(clickTopicCategory);
      setSelectTopicCategory(ids);
      setTopicFilterInput({ ...topicFilterInput, categoryIds: ids });
    },
    []
  );

  const rows = memoData.memoAllTopic.filter(
    (it) =>
      selectTopicCategory === undefined ||
      selectTopicCategory.includes(it.categoryId ?? -1)
  );

  return (
    <>
      {/* 显示 DataGrid Topic */}
      <DraggableDialog title="配置知识库问题" ref={refOfTopicDialog}>
        <TopicForm
          defaultValues={topic}
          topicList={rows}
          categoryList={memoData?.allTopicCategory ?? []}
        />
      </DraggableDialog>
      <Grid container className={classes.root}>
        <BotSidecar
          memoData={memoData}
          allTopicCategory={memoData?.allTopicCategory}
          refetch={refetch}
          onTopicCategoryClick={onTopicCategoryClick}
        />
        <Grid item xs={12} sm={10}>
          <TopicSearchFrom
            defaultValues={defaultValue}
            currentValues={topicFilterInput}
            searchAction={(values) => {
              refetchTopic({ variables: { topicFilterInput: values } });
            }}
          />
          <DataGrid
            localeText={GRID_DEFAULT_LOCALE_TEXT}
            rows={rows}
            columns={columns}
            components={{
              Toolbar: CustomerGridToolbarCreater({
                newButtonClick,
                deleteButtonClick,
                refetch: () => {
                  refetchTopic();
                },
              }),
            }}
            onRowClick={(param) => {
              handleClickOpen(param.row as Topic);
            }}
            pagination
            pageSize={20}
            rowsPerPageOptions={[20]}
            loading={loading}
            disableSelectionOnClick
            checkboxSelection
            onSelectionModelChange={(gridRowId: GridRowId[]) => {
              setSelectionModel(gridRowId);
            }}
            selectionModel={selectionModel}
          />
        </Grid>
      </Grid>
    </>
  );
}
