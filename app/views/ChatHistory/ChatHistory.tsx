import React, { useRef, useState } from 'react';
import _ from 'lodash';
import { Object } from 'ts-toolbelt';

import { gql, useQuery } from '@apollo/client';
import DateFnsUtils from '@date-io/date-fns';

import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridToolbar,
} from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import {
  ConversationQueryInput,
  CONV_PAGE_QUERY,
  SearchConv,
} from 'app/domain/graphql/Conversation';
import { Conversation } from 'app/domain/Conversation';
import MessageList from 'app/components/MessageList/MessageList';
import SearchForm from 'app/components/SearchForm/SearchForm';
import { Divider } from '@material-ui/core';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import { AllStaffInfo } from 'app/domain/graphql/Staff';
import { SelectKeyValue } from 'app/components/Form/ChipSelect';
import { PageParam } from 'app/domain/graphql/Query';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'staffId', headerName: '客服ID', width: 150 },
  { field: 'realName', headerName: '客服实名', width: 150 },
  { field: 'nickName', headerName: '客服昵称', width: 150 },
  { field: 'startTime', headerName: '开始时间', width: 150 },
  { field: 'userId', headerName: '客户ID', width: 150 },
  { field: 'userName', headerName: '客户名称', width: 150 },
  { field: 'fromShuntName', headerName: '接待组', width: 150 },
  { field: 'fromGroupName', headerName: '客服组', width: 150 },
  { field: 'fromIp', headerName: '访客来源ip', width: 150 },
  { field: 'fromPage', headerName: '来源页', width: 150 },
  { field: 'fromTitle', headerName: '来源页标题', width: 150 },
  { field: 'fromType', headerName: '来源类型', width: 150 },
  {
    field: 'inQueueTime',
    headerName: '在列队时间',
    type: 'number',
    width: 150,
  },
  {
    field: 'interaction',
    headerName: '来源类型',
    description: '客户来自哪个接入方式.',
    sortable: false,
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '机器人会话';
      if (params.value === 1) {
        result = '客服正常会话';
      }
      return result;
    },
  },
  { field: 'convType', headerName: '会话类型', width: 150 },
  { field: 'vipLevel', headerName: 'VIP', type: 'number', width: 150 },
  {
    field: 'visitRange',
    headerName: '与上一次来访的时间差',
    type: 'number',
    width: 150,
  },
  { field: 'transferType', headerName: '转人工类型', width: 150 },
  { field: 'humanTransferSessionId', headerName: '转接的会话ID', width: 150 },
  {
    field: 'transferFromStaffName',
    headerName: '转接来源客服名称',
    width: 150,
  },
  { field: 'transferFromGroup', headerName: '转接来源客服组名称', width: 150 },
  { field: 'transferRemarks', headerName: '转接来源备注', width: 150 },
  {
    field: 'isStaffInvited',
    headerName: '客服是否邀请会话',
    type: 'boolean',
    width: 150,
  },
  { field: 'beginner', headerName: '会话发起方', width: 150 },
  { field: 'relatedId', headerName: '关联会话id', width: 150 },
  { field: 'relatedType', headerName: '关联会话类型', width: 150 },
  { field: 'category', headerName: '会话分类信息', width: 150 },
  { field: 'categoryDetail', headerName: '会话咨询分类明细', width: 150 },
  { field: 'closeReason', headerName: '会话关闭原因', width: 150 },
  { field: 'endTime', headerName: '结束时间', width: 150 },
  {
    field: 'staffFirstReplyTime',
    headerName: '客服首次响应的时间',
    type: 'dateTime',
    width: 150,
  },
  {
    field: 'firstReplyCost',
    headerName: '客服首次响应时长',
    type: 'number',
    width: 150,
  },
  {
    field: 'stickDuration',
    headerName: '客服置顶时长',
    type: 'number',
    width: 150,
  },
  { field: 'remarks', headerName: '会话备注', width: 150 },
  { field: 'status', headerName: '会话解决状态', width: 150 },
  {
    field: 'roundNumber',
    headerName: '对话回合数',
    type: 'number',
    width: 150,
  },
  {
    field: 'clientFirstMessageTime',
    headerName: '访客首条消息时间',
    width: 150,
  },
  { field: 'avgRespDuration', headerName: '客服平均响应时长', width: 150 },
  { field: 'isValid', headerName: '是否有效会话', width: 150 },
  {
    field: 'staffMessageCount',
    headerName: '客服消息数',
    type: 'number',
    width: 150,
  },
  {
    field: 'userMessageCount',
    headerName: '用户消息数',
    type: 'number',
    width: 150,
  },
  {
    field: 'totalMessageCount',
    headerName: '总消息数',
    type: 'number',
    width: 150,
  },
  {
    field: 'treatedTime',
    headerName: '留言处理时间',
    type: 'number',
    width: 150,
  },
  {
    field: 'isEvaluationInvited',
    headerName: '客服是否邀评',
    type: 'boolean',
    width: 150,
  },
  { field: 'terminator', headerName: '会话中止方', width: 150 },
];

const dateFnsUtils = new DateFnsUtils();

const defaultValue = {
  page: new PageParam(),
  timeRange: { from: dateFnsUtils.startOfMonth(new Date()), to: new Date() },
};

type Graphql = Object.Merge<AllStaffInfo, SearchConv>;

const QUERY = gql`
  ${CONV_PAGE_QUERY}
  query Conversation($conversationQueryInput: ConversationQueryInput!) {
    searchConv(conversationQuery: $conversationQueryInput) {
      ...PageOnSearchHitPage
    }
    allStaff {
      avatar
      enabled
      gender
      id
      maxTicketAllTime
      maxTicketPerDay
      mobilePhone
      nickName
      organizationId
      password
      personalizedSignature
      realName
      role
      simultaneousService
      staffGroupId
      staffType
      username
    }
    allStaffGroup {
      id
      organizationId
      groupName
    }
    allStaffShunt {
      code
      id
      name
      organizationId
      shuntClassId
    }
  }
`;

export default function ChatHistory() {
  const refOfDialog = useRef<DraggableDialogRef>(null);

  const [conversationQueryInput, setConversationQueryInput] =
    useState<ConversationQueryInput>(defaultValue);
  const [selectConversation, setSelectConversation] = useState<Conversation>();

  const { loading, data, refetch } = useQuery<Graphql>(QUERY, {
    variables: { conversationQueryInput },
  });

  const handleClickOpen = (conversation: Conversation) => {
    setSelectConversation(conversation);
    refOfDialog.current?.setOpen(true);
  };

  const handlePageChange = (params: number) => {
    // {page: 0, pageCount: 1, pageSize: 25, paginationMode: "server", rowCount: 9}
    conversationQueryInput.page = new PageParam(
      params,
      conversationQueryInput.page.size
    );
    setConversationQueryInput(conversationQueryInput);
    refetch({ conversationQueryInput });
  };
  const handlePageSizeChange = (params: number) => {
    conversationQueryInput.page = new PageParam(
      conversationQueryInput.page.page,
      params
    );
    setConversationQueryInput(conversationQueryInput);
    refetch({ conversationQueryInput });
  };

  const setSearchParams = (searchParams: ConversationQueryInput) => {
    searchParams.page = conversationQueryInput.page;
    setConversationQueryInput(searchParams);
    refetch({ conversationQueryInput: searchParams });
  };

  const result = data?.searchConv;
  const rows =
    result && result.content ? result.content.map((it) => it.content) : [];
  const pageSize = result ? result.size : 20;
  const rowCount = result ? result.totalElements : 0;

  const staffList = data ? data?.allStaff : [];
  const staffGroupList = data ? data?.allStaffGroup : [];
  const staffShuntList = data ? data?.allStaffShunt : [];

  const selectKeyValueList: SelectKeyValue[] = [
    {
      label: '接待客服',
      name: 'staffIdList',
      selectList: _.zipObject(
        staffList.map((value) => value.id),
        staffList.map((value) => value.nickName)
      ),
      defaultValue: [],
    },
    {
      label: '客服组',
      name: 'staffGroupIdList',
      selectList: _.zipObject(
        staffGroupList.map((value) => value.id),
        staffGroupList.map((value) => value.groupName)
      ),
      defaultValue: [],
    },
    {
      label: '分流组',
      name: 'shuntIdList',
      selectList: _.zipObject(
        staffShuntList.map((value) => value.id),
        staffShuntList.map((value) => value.name)
      ),
      defaultValue: [],
    },
  ];

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <DraggableDialog title="详细聊天消息" ref={refOfDialog}>
        {selectConversation && (
          <MessageList conversation={selectConversation} />
        )}
      </DraggableDialog>
      <SearchForm
        defaultValues={defaultValue}
        currentValues={conversationQueryInput}
        searchAction={setSearchParams}
        selectKeyValueList={selectKeyValueList}
      />
      <Divider variant="inset" component="li" />
      <DataGrid
        localeText={GRID_DEFAULT_LOCALE_TEXT}
        rows={rows}
        columns={columns}
        components={{
          Toolbar: GridToolbar,
        }}
        pagination
        pageSize={pageSize}
        // 全部的列表
        rowCount={rowCount}
        rowsPerPageOptions={[10, 20, 50, 100]}
        paginationMode="server"
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        disableSelectionOnClick
        onRowClick={(param) => {
          handleClickOpen(param.row as Conversation);
        }}
      />
    </div>
  );
}
