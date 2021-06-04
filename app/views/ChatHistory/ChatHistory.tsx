import React, { useState } from 'react';

import { useQuery } from '@apollo/client';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridToolbar,
  GridPageChangeParams,
} from '@material-ui/data-grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Draggable from 'react-draggable';
import Paper, { PaperProps } from '@material-ui/core/Paper';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import {
  ConversationGraphql,
  ConversationQueryInput,
  PageParam,
  QUERY_CONVERSATION,
} from 'app/domain/graphql/Conversation';
import { Conversation, PageContent } from 'app/domain/Conversation';
import MessageList from 'app/components/MessageList/MessageList';
import SearchForm from 'app/components/SearchForm/SearchForm';
import { Divider } from '@material-ui/core';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
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
  { field: 'staffId', headerName: '客服ID', width: 150 },
  { field: 'staffId', headerName: '客服实名', width: 150 },
  { field: 'nickName', headerName: '客服昵称', width: 150 },
  { field: 'startTime', headerName: '开始时间', width: 150 },
  { field: 'userId', headerName: '客户ID', width: 150 },
  { field: 'userName', headerName: '客户名称', width: 150 },
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
    width: 150,
  },
  { field: 'firstReplyCost', headerName: '客服首次响应时长', width: 150 },
  { field: 'stickDuration', headerName: '客服置顶时长', width: 150 },
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

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const defaultValue = { page: new PageParam() };

export default function DataGridDemo() {
  const [open, setOpen] = useState(false);
  const [
    conversationQueryInput,
    setConversationQueryInput,
  ] = useState<ConversationQueryInput>(defaultValue);
  const [
    selectConversation,
    setSelectConversation,
  ] = useState<Conversation | null>(null);

  const { loading, data, refetch } = useQuery<ConversationGraphql>(
    QUERY_CONVERSATION,
    {
      variables: { conversationQueryInput },
    }
  );

  const handleClickOpen = (conversation: Conversation) => {
    setSelectConversation(conversation);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePageChange = (params: GridPageChangeParams) => {
    // {page: 0, pageCount: 1, pageSize: 25, paginationMode: "server", rowCount: 9}
    conversationQueryInput.page = new PageParam(params.page, params.pageSize);
    setConversationQueryInput(conversationQueryInput);
    refetch({ conversationQueryInput });
  };

  const setSearchParams = (searchParams: ConversationQueryInput) => {
    searchParams.page = conversationQueryInput.page;
    setConversationQueryInput(searchParams);
    refetch({ conversationQueryInput: searchParams });
  };

  const result = data
    ? (JSON.parse(data.searchConv) as PageContent<Conversation>)
    : null;
  const rows =
    result && result.content ? result.content.map((it) => it.content) : [];
  const pageSize = result ? result.size : 0;
  const rowCount = result ? result.totalElements : 0;

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <Dialog
        disableEnforceFocus
        disableBackdropClick
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          详细聊天消息
        </DialogTitle>
        <DialogContent>
          {selectConversation && (
            <MessageList conversation={selectConversation} />
          )}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            取消
          </Button>
        </DialogActions>
      </Dialog>
      <SearchForm
        defaultValues={defaultValue}
        currentValues={conversationQueryInput}
        searchAction={setSearchParams}
        selectKeyValueList={[]}
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
        onPageSizeChange={handlePageChange}
        loading={loading}
        disableSelectionOnClick
        onRowClick={(param) => {
          handleClickOpen(param.row as Conversation);
        }}
      />
    </div>
  );
}
