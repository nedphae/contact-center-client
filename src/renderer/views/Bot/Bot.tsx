import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  RefQuestion,
} from 'renderer/domain/Bot';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetterParams,
} from '@material-ui/data-grid';
import { CustomerGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
import TopicForm from 'renderer/components/Bot/TopicForm';
import BotSidecar from 'renderer/components/Bot/BotSidecar';
import 'renderer/assets/css/DropdownTreeSelect.global.css';
import useAlert from 'renderer/hook/alert/useAlert';
import { TopicFilterInput } from 'renderer/domain/graphql/Bot';
import TopicSearchFrom from 'renderer/components/Bot/TopicSearchForm';

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

interface TopicFilterInputGraphql {
  topicFilterInput: TopicFilterInput;
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
      questionPrecision
      similarQuestionEnable
      similarQuestionNotice
      similarQuestionCount
      hotQuestion
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

const MUTATION_TOPIC = gql`
  mutation DeleteTopic($ids: [String!]!) {
    deleteTopicByIds(ids: $ids)
  }
`;

const defaultValue: TopicFilterInput = {
  keyword: '',
};

export default function Bot() {
  const classes = useStyles();
  const { t, i18n } = useTranslation();

  const refOfTopicDialog = useRef<DraggableDialogRef>(null);
  const [topic, setTopic] = useState<Topic>();
  const [topicFilterInput, setTopicFilterInput] =
    useState<TopicFilterInput>(defaultValue);
  const [allTopicCache, setAllTopicCache] = useState<Topic[]>([]);
  const { data, loading, refetch } = useQuery<BotGraphql>(QUERY_BOTS);
  const {
    data: topicData,
    refetch: refetchTopic,
    variables,
  } = useQuery<TopicGraphql, TopicFilterInputGraphql>(QUERY_TOPIC, {
    variables: { topicFilterInput },
  });
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  const [selectTopicCategory, setSelectTopicCategory] = useState<number[]>();
  const [selectTC, setSelectTC] = useState<TopicCategory>();

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

  const refetchAll = () => {
    refetch();
    refetchTopic();
  };

  const handleClickOpen = (selectTopic: Topic) => {
    setTopic(selectTopic);
    refOfTopicDialog.current?.setOpen(true);
  };

  function newButtonClick() {
    setTopic(undefined);
    refOfTopicDialog.current?.setOpen(true);
  }

  async function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      await deleteTopicById({ variables: { ids: selectionModel } });
      refetchTopic();
    }
  }

  const memoData = useMemo(() => {
    if (data) {
      // useMemo 优化一下
      if (_.isEqual(variables?.topicFilterInput, defaultValue)) {
        // 缓存全部 topic 数据
        setAllTopicCache(topicData?.searchTopic ?? []);
      }

      // 生成各种需要的Map, 根据 ID 填充名称
      const allTopicCategory = _.cloneDeep(data?.allTopicCategory ?? []);
      const allBotConfig = _.cloneDeep(data?.allBotConfig ?? []);
      const allKnowledgeBase = _.cloneDeep(data?.allKnowledgeBase ?? []);
      const allTopic = _.cloneDeep(topicData?.searchTopic ?? []);
      const botConfigMap = _.groupBy(allBotConfig, 'knowledgeBaseId');

      const allKnowledgeBaseMap = _.groupBy(allKnowledgeBase, 'id');
      const allTopicCategoryMap = _.groupBy(allTopicCategory, 'id');
      const memoAllRefTopicMap = _.groupBy(allTopic, 'refId');

      const topicCategoryPidGroup = _.groupBy(allTopicCategory, (it) => it.pid);
      const topicCategoryGroup = _.groupBy(
        topicData?.searchTopic,
        'categoryId'
      );

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

      const memoAllTopic = allTopic
        .filter((it) => it.type === 1)
        .map((it) => {
          if (it.categoryId && it.knowledgeBaseId) {
            it.categoryName =
              allTopicCategoryMap[it.categoryId.toString()][0].name;
            it.knowledgeBaseName =
              allKnowledgeBaseMap[it.knowledgeBaseId.toString()][0].name;
          }
          if (it.id) {
            it.refList = memoAllRefTopicMap[it.id];
          }
          return it;
        });

      return {
        allKnowledgeBase: memoAllKnowledgeBase,
        botConfigMap,
        botConfigList: allBotConfig,
        allTopicCategory: pTopicCategory,
        memoAllTopic,
        memoAllRefTopicMap,
      };
    }
    return undefined;
  }, [data, topicData?.searchTopic, variables?.topicFilterInput]);

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
      setSelectTC(clickTopicCategory);
      // TOOD: 更新数据，实现远程过滤
      // setTopicFilterInput({ ...topicFilterInput, categoryIds: ids });
    },
    []
  );

  const rows =
    memoData?.memoAllTopic?.filter(
      (it) =>
        selectTopicCategory === undefined ||
        selectTopicCategory.includes(it.categoryId ?? -1)
    ) ?? [];

  const allTopicData =
    allTopicCache?.filter(
      (it) =>
        selectTopicCategory === undefined ||
        selectTopicCategory.includes(it.categoryId ?? -1)
    ) ?? [];

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('Id'), width: 200 },
    {
      field: 'knowledgeBaseName',
      headerName: t('Affiliated Knowledge Base'),
      width: 200,
    },
    { field: 'categoryName', headerName: t('Affiliated Category'), width: 200 },
    { field: 'question', headerName: t('Question'), width: 250 },
    {
      field: 'answer',
      headerName: t('External answer'),
      width: 250,
      valueGetter: (params: GridValueGetterParams) => {
        const answer = params.value as Answer[] | undefined;
        let viewText = '';
        if (answer) {
          if (answer[2]?.content) {
            viewText = `[${t('Rich text')}]`;
          }
          if (answer[1]?.content) {
            viewText = `[${t('Image')}]`;
          }
          if (answer[0]?.content) {
            viewText = answer[0]?.content;
          }
        }
        return viewText;
      },
    },
    { field: 'innerAnswer', headerName: t('Internal answers'), width: 250 },
    {
      field: 'fromType',
      headerName: t('Source of the question'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Other');
        switch (params.value) {
          case 0: {
            result = t('User manually added');
            break;
          }
          case 1: {
            result = t('File import');
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
      headerName: t('Question type'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Other');
        switch (params.value) {
          case 1: {
            result = t('Standard question');
            break;
          }
          case 2: {
            result = t('Similar question');
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
      field: 'refList',
      headerName: t('Similar question'),
      width: 250,
      valueGetter: (params: GridValueGetterParams) => {
        const refList = params.value as RefQuestion[] | undefined;
        return refList?.map((refQ) => refQ.question);
      },
    },
    {
      field: 'enabled',
      headerName: t('Effective'),
      width: 150,
      type: 'boolean',
    },
    { field: 'effectiveTime', headerName: t('Validity time'), width: 200 },
    { field: 'failureTime', headerName: t('Validity ends'), width: 150 },
    { field: 'md5', headerName: t('MD5 of the question'), width: 150 },
  ];

  return (
    <>
      {/* 显示 DataGrid Topic */}
      <DraggableDialog
        maxWidth="lg"
        title={t('Configuring Knowledge Base Qestion')}
        ref={refOfTopicDialog}
      >
        <TopicForm
          defaultValues={topic}
          topicList={allTopicData}
          categoryList={memoData?.allTopicCategory ?? []}
          afterSubmit={() => {
            refetchTopic();
          }}
        />
      </DraggableDialog>
      {/* 后面使用页面跳转到修改表单，参数通过 useLocation().state 或者 useLocation().search/useSearchParams */}
      {/* <Link
        to={{
          pathname: '/courses',
          search: '?sort=name',
          hash: '#the-hash',
          state: { fromDashboard: true },
        }}
      /> */}
      <Grid container className={classes.root}>
        <BotSidecar
          loading={loading}
          memoData={memoData}
          allTopicCategory={memoData?.allTopicCategory}
          refetch={refetchAll}
          onTopicCategoryClick={onTopicCategoryClick}
          selectTC={selectTC}
        />
        <Grid item xs={12} sm={10}>
          <TopicSearchFrom
            defaultValues={defaultValue}
            currentValues={topicFilterInput}
            searchAction={(values) => {
              refetchTopic({ topicFilterInput: values });
            }}
          />
          <DataGrid
            localeText={gridLocaleTextMap.get(i18n.language)}
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
