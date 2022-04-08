import React, { useState } from 'react';
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
  ConversationFilterInput,
  CONV_PAGE_QUERY,
  SearchConv,
} from 'app/domain/graphql/Conversation';
import { Conversation } from 'app/domain/Conversation';
import MessageList from 'app/components/MessageList/MessageList';
import SearchForm from 'app/components/SearchForm/SearchForm';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  PaperProps,
  Slider,
  Typography,
} from '@material-ui/core';
import { AllStaffInfo } from 'app/domain/graphql/Staff';
import { SelectKeyValue } from 'app/components/Form/ChipSelect';
import { PageParam } from 'app/domain/graphql/Query';
import Draggable from 'react-draggable';
import javaInstant2DateStr from 'app/utils/timeUtils';
import { Control, Controller } from 'react-hook-form';
import { LazyCustomerInfo } from 'app/components/Chat/DetailCard/panel/CustomerInfo';

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Paper {...props} />
    </Draggable>
  );
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'staffId', headerName: '客服ID', width: 150 },
  { field: 'realName', headerName: '客服实名', width: 150 },
  { field: 'nickName', headerName: '客服昵称', width: 150 },
  { field: 'userId', headerName: '客户ID', width: 150 },
  { field: 'userName', headerName: '客户名称', width: 150 },
  {
    field: 'startTime',
    headerName: '开始时间',
    type: 'dateTime',
    width: 200,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
  {
    field: 'staffFirstReplyTime',
    headerName: '客服首次响应的时间',
    type: 'dateTime',
    width: 200,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
  {
    field: 'firstReplyCost',
    headerName: '客服首次响应时长',
    type: 'number',
    width: 200,
  },
  {
    field: 'endTime',
    headerName: '结束时间',
    type: 'dateTime',
    width: 200,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
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
  {
    field: 'transferType',
    headerName: '转人工类型',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '机器人会话';
      switch (params.value) {
        case 'INITIATIVE': {
          result = '主动转人工';
          break;
        }
        default: {
          result = '';
          break;
        }
      }
      return result;
    },
  },
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
  // {
  //   field: 'stickDuration',
  //   headerName: '客服置顶时长',
  //   type: 'number',
  //   width: 150,
  // },
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
    width: 200,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
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
  timeRange: {
    from: dateFnsUtils.format(
      dateFnsUtils.startOfDay(new Date()),
      "yyyy-MM-dd'T'HH:mm:ss.SSSXX"
    ),
    to: dateFnsUtils.format(
      dateFnsUtils.endOfDay(new Date()),
      "yyyy-MM-dd'T'HH:mm:ss.SSSXX"
    ),
  },
};

type Graphql = Object.Merge<AllStaffInfo, SearchConv>;

const QUERY = gql`
  ${CONV_PAGE_QUERY}
  query Conversation($conversationFilterInput: ConversationFilterInput!) {
    searchConv(conversationFilter: $conversationFilterInput) {
      ...pageOnSearchHitPage
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
      groupId
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
      openPush
      authorizationToken
    }
  }
`;

export default function ChatHistory() {
  const [open, setOpen] = useState(false);
  const [conversationFilterInput, setConversationFilterInput] =
    useState<ConversationFilterInput>(defaultValue);
  const [selectConversation, setSelectConversation] = useState<Conversation>();

  const { loading, data, refetch } = useQuery<Graphql>(QUERY, {
    variables: { conversationFilterInput },
  });

  const handleClickOpen = (conversation: Conversation) => {
    setSelectConversation(conversation);
    setOpen(true);
  };

  const handlePageChange = (params: number) => {
    // {page: 0, pageCount: 1, pageSize: 25, paginationMode: "server", rowCount: 9}
    conversationFilterInput.page = new PageParam(
      params,
      conversationFilterInput.page.size
    );
    setConversationFilterInput(conversationFilterInput);
    refetch({ conversationFilterInput });
  };
  const handlePageSizeChange = (params: number) => {
    conversationFilterInput.page = new PageParam(
      conversationFilterInput.page.page,
      params
    );
    setConversationFilterInput(conversationFilterInput);
    refetch({ conversationFilterInput });
  };

  const setSearchParams = (searchParams: ConversationFilterInput) => {
    let newSearchParams = searchParams;
    if (searchParams.evaluation) {
      newSearchParams = _.omit(newSearchParams, 'evaluation');
    } else {
      // 没有选择区间搜索，删除区间字段
      newSearchParams = _.omit(
        newSearchParams,
        'evaluation',
        'evaluationRange'
      );
    }
    newSearchParams.page = conversationFilterInput.page;
    setConversationFilterInput(newSearchParams);
    refetch({ conversationFilterInput: newSearchParams });
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
      name: 'groupIdList',
      selectList: _.zipObject(
        staffGroupList.map((value) => value.id),
        staffGroupList.map((value) => value.groupName)
      ),
      defaultValue: [],
    },
    {
      label: '接待组',
      name: 'shuntIdList',
      selectList: _.zipObject(
        staffShuntList.map((value) => value.id),
        staffShuntList.map((value) => value.name)
      ),
      defaultValue: [],
    },
  ];

  const handleClose = () => {
    setOpen(false);
  };

  const handleDialogClose = (
    _event: unknown,
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason !== 'backdropClick') {
      handleClose();
    }
  };

  const evaluateMarks = [
    {
      value: 1,
      label: '非常不满意',
    },
    {
      value: 25,
      label: '不满意',
    },

    {
      value: 50,
      label: '不满意',
    },
    {
      value: 75,
      label: '满意',
    },
    {
      value: 100,
      label: '非常满意',
    },
  ];

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <Dialog
        disableEnforceFocus
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleDialogClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          详细聊天消息
        </DialogTitle>
        <DialogContent>
          {selectConversation && (
            <Grid container alignItems="flex-start" justifyContent="center">
              <Grid item xs={8}>
                <MessageList conversation={selectConversation} />
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6" gutterBottom align="center">
                  客户信息
                </Typography>
                <Divider />
                <LazyCustomerInfo userId={selectConversation.userId} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            取消
          </Button>
        </DialogActions>
      </Dialog>
      <SearchForm
        defaultValues={defaultValue}
        currentValues={conversationFilterInput}
        searchAction={setSearchParams}
        selectKeyValueList={selectKeyValueList}
        customerForm={(control: Control<ConversationFilterInput>) => (
          <Grid container alignItems="flex-start">
            <Grid item xs={1}>
              <Controller
                control={control}
                defaultValue
                name="evaluation"
                render={({ field: { onChange, value } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                      />
                    }
                    label="筛选满意度区间"
                  />
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <Typography id="range-slider" gutterBottom>
                满意度区间
              </Typography>
              <Controller
                control={control}
                name="evaluationRange"
                defaultValue={{ from: 1, to: 100 }}
                render={({ field: { onChange, value } }) => (
                  <Slider
                    value={[value?.from ?? 1, value?.to ?? 100]}
                    // valueLabelFormat={valueLabelFormat}
                    // getAriaValueText={valuetext}
                    valueLabelDisplay="auto"
                    aria-labelledby="range-slider"
                    step={null}
                    marks={evaluateMarks}
                    onChange={(_event, newValue) => {
                      const arrayValue = newValue as number[];
                      onChange({ from: arrayValue[0], to: arrayValue[1] });
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
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
        rowsPerPageOptions={[10, 20, 50]}
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
