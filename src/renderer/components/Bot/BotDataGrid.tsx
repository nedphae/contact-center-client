import { useMutation, useQuery } from '@apollo/client';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetterParams,
} from '@material-ui/data-grid';
import _ from 'lodash';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Answer,
  KnowledgeBase,
  Topic,
  TopicCategory,
} from 'renderer/domain/Bot';
import {
  TopicFilterInput,
  SEARCH_TOPIC,
  TopicFilterInputGraphql,
  TopicPageGraphql,
  MUTATION_TOPIC,
  QUERY_TOPIC_CATEGORY_BY_KNOWLEDGE_BASE_ID,
  TopicCategoryGraphql,
} from 'renderer/domain/graphql/Bot';
import { PageParam } from 'renderer/domain/graphql/Query';
import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
import DraggableDialog, {
  DraggableDialogRef,
} from '../DraggableDialog/DraggableDialog';
import { CustomerGridToolbarCreater } from '../Table/CustomerGridToolbar';
import TopicForm from './TopicForm';
import TopicSearchFrom from './TopicSearchForm';

interface BotTreeViewProps {
  knowledgeBase: KnowledgeBase;
  topicCategory: TopicCategory | undefined;
}

export default function BotDataGrid(props: BotTreeViewProps) {
  const { knowledgeBase, topicCategory } = props;
  const { t, i18n } = useTranslation();

  const knowledgeBaseId = knowledgeBase.id;

  const topicFilterInput: TopicFilterInput = {
    keyword: '',
    knowledgeBaseId,
    // 只查询标准问题
    type: 1,
    categoryIds: topicCategory?.id ? [topicCategory?.id] : undefined,
    page: new PageParam(0, 20, 'DESC', ['createdDate']),
  };

  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const refOfTopicDialog = useRef<DraggableDialogRef>(null);
  const [topic, setTopic] = useState<Topic>({
    knowledgeBaseId,
  } as unknown as Topic);

  const { data: categoryDate } = useQuery<TopicCategoryGraphql>(
    QUERY_TOPIC_CATEGORY_BY_KNOWLEDGE_BASE_ID,
    {
      variables: { knowledgeBaseId },
    }
  );

  const allTopicCategory = categoryDate?.topicCategoryByKnowledgeBaseId;
  const topicCategoryIdGroup = allTopicCategory
    ? _.groupBy(allTopicCategory, (it) => it.id)
    : {};

  const {
    data,
    loading,
    refetch: refetchTopic,
    variables,
  } = useQuery<TopicPageGraphql, TopicFilterInputGraphql>(SEARCH_TOPIC, {
    variables: { topicFilterInput },
    fetchPolicy: 'no-cache',
  });

  const [deleteTopicById] = useMutation<unknown>(MUTATION_TOPIC);

  const columns: GridColDef[] = [
    // { field: 'id', headerName: t('Id'), width: 200 },
    {
      field: 'knowledgeBaseId',
      headerName: t('Affiliated Knowledge Base'),
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Other');
        if (knowledgeBaseId === params.value) {
          result = knowledgeBase.name;
        }
        return result;
      },
    },
    {
      field: 'categoryId',
      headerName: t('Affiliated Category'),
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Other');
        const categoryId = params.value as number;
        if (
          categoryId &&
          topicCategoryIdGroup &&
          topicCategoryIdGroup[categoryId]
        ) {
          result = topicCategoryIdGroup[categoryId][0]?.name ?? t('Other');
        }
        return result;
      },
    },
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
        const refList = params.value as Topic[] | undefined;
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

  const searchTopic = data?.searchTopic;
  const rows =
    searchTopic && searchTopic.content
      ? searchTopic.content.map((it) => it.content)
      : [];
  const pageSize = searchTopic ? searchTopic.size : 20;
  const rowCount = searchTopic ? searchTopic.totalElements : 0;

  const deleteButtonClick = async () => {
    if (selectionModel && selectionModel.length > 0) {
      await deleteTopicById({ variables: { ids: selectionModel } });
      refetchTopic();
    }
  };

  const newButtonClick = () => {
    setTopic({ knowledgeBaseId: knowledgeBase.id } as unknown as Topic);
    refOfTopicDialog.current?.setOpen(true);
  };

  const handleClickOpen = (selectTopic: Topic) => {
    setTopic(selectTopic);
    refOfTopicDialog.current?.setOpen(true);
  };

  const handlePageChange = (params: number) => {
    const currentVariables = variables?.topicFilterInput ?? topicFilterInput;
    currentVariables.page.page = params;
    refetchTopic({ topicFilterInput: currentVariables });
  };
  const handlePageSizeChange = (params: number) => {
    const currentVariables = variables?.topicFilterInput ?? topicFilterInput;
    currentVariables.page.size = params;
    refetchTopic({ topicFilterInput: currentVariables });
  };

  return (
    <div
      style={{
        height: 'calc(100vh - 158px)',
        width: '100%',
      }}
    >
      <TopicSearchFrom
        defaultValues={topicFilterInput}
        currentValues={variables?.topicFilterInput}
        searchAction={(values) => {
          refetchTopic({
            topicFilterInput: _.defaults(values, variables?.topicFilterInput),
          });
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
        pageSize={pageSize}
        rowCount={rowCount}
        rowsPerPageOptions={[10, 20, 30]}
        paginationMode="server"
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        disableSelectionOnClick
        checkboxSelection
        onSelectionModelChange={(gridRowId: GridRowId[]) => {
          setSelectionModel(gridRowId);
        }}
        selectionModel={selectionModel}
      />
      {/* 显示 DataGrid Topic */}
      <DraggableDialog
        maxWidth="lg"
        title={t('Configuring Knowledge Base Question')}
        ref={refOfTopicDialog}
      >
        <TopicForm
          defaultValues={topic}
          afterSubmit={() => {
            refetchTopic();
          }}
        />
      </DraggableDialog>
    </div>
  );
}
