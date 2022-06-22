import { useState } from 'react';
import _ from 'lodash';

import { gql, useMutation, useQuery } from '@apollo/client';
import DateFnsUtils from '@date-io/date-fns';

import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
} from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'renderer/variables/gridLocaleText';
import {
  ConversationFilterInput,
  CONV_PAGE_QUERY,
  MutationExportGraphql,
  MUTATION_CONV_EXPORT,
  SearchConv,
} from 'renderer/domain/graphql/Conversation';
import {
  Conversation,
  Evaluate,
  getEvaluation,
} from 'renderer/domain/Conversation';
import MessageList from 'renderer/components/MessageList/MessageList';
import SearchForm from 'renderer/components/SearchForm/SearchForm';
import {
  Checkbox,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  PaperProps,
  Slider,
  Typography,
} from '@material-ui/core';
import { AllStaffInfo, STAFF_FIELD } from 'renderer/domain/graphql/Staff';
import { SelectKeyValue } from 'renderer/components/Form/ChipSelect';
import { PageParam } from 'renderer/domain/graphql/Query';
import Draggable from 'react-draggable';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import { Control, Controller } from 'react-hook-form';
import { LazyCustomerInfo } from 'renderer/components/Chat/DetailCard/panel/CustomerInfo';
import { CustomerExportGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import useAlert from 'renderer/hook/alert/useAlert';
import { getDownloadS3ChatFilePath } from 'renderer/config/clientConfig';
import { DialogTitle } from 'renderer/components/DraggableDialog/DraggableDialog';
import DetailTitle from './DetailTitle';

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
  { field: 'uid', headerName: '客户UID', width: 150 },
  { field: 'userName', headerName: '客户名称', width: 150 },
  { field: 'country', headerName: '国家', width: 150 },
  { field: 'city', headerName: '城市', width: 150 },
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
    field: 'clientFirstMessageTime',
    headerName: '访客首条消息时间',
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
  {
    field: 'fromType',
    headerName: '来源类型',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '未知';
      switch (params.value) {
        case 'WEB': {
          result = '网页';
          break;
        }
        case 'IOS': {
          result = 'ios';
          break;
        }
        case 'ANDROID': {
          result = 'android';
          break;
        }
        case 'WX': {
          result = '微信';
          break;
        }
        case 'WX_MA': {
          result = '微信小程序';
          break;
        }
        case 'WB': {
          result = '微博';
          break;
        }
        case 'OPEN': {
          result = '开放接口';
          break;
        }
        default: {
          result = '客户';
          break;
        }
      }
      return result;
    },
  },
  {
    field: 'evaluate.evaluation',
    headerName: '用户评价分数',
    width: 200,
    valueGetter: (params: GridValueGetterParams) => {
      const evaluate = params.row.evaluate as Evaluate;
      return getEvaluation(evaluate?.evaluation);
    },
  },
  {
    field: 'evaluate.evaluationRemark',
    headerName: '用户评价内容',
    width: 250,
    valueGetter: (params: GridValueGetterParams) => {
      const evaluate = params.row.evaluate as Evaluate;
      return evaluate?.evaluationRemark;
    },
  },
  {
    field: 'evaluate.userResolvedStatus',
    headerName: '用户标记的解决状态',
    width: 200,
    valueGetter: (params: GridValueGetterParams) => {
      const evaluate = params.row.evaluate as Evaluate;
      let result = '未知';
      switch (evaluate?.userResolvedStatus) {
        case 1: {
          result = '已解决';
          break;
        }
        case 2: {
          result = '未解决';
          break;
        }
        default: {
          result = '未知';
          break;
        }
      }
      return result;
    },
  },
  {
    field: 'evaluate.userResolvedStatus',
    headerName: '解决状态',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      const evaluate = params.row.evaluate as Evaluate;
      let result = '未选择';
      switch (evaluate?.userResolvedStatus) {
        case 1: {
          result = '已解决';
          break;
        }
        case 2: {
          result = '未解决';
          break;
        }
        default: {
          result = '未选择';
          break;
        }
      }
      return result;
    },
  },
  {
    field: 'inQueueTime',
    headerName: '在列队时间',
    type: 'number',
    width: 150,
  },
  {
    field: 'interaction',
    headerName: '会话服务类型',
    description: '人工/机器人会话.',
    sortable: false,
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '机器人会话';
      if (params.value === 1) {
        result = '客服会话';
      }
      return result;
    },
  },
  { field: 'vipLevel', headerName: 'VIP', type: 'number', width: 150 },
  {
    field: 'visitRange',
    headerName: '与上一次来访的时间差',
    type: 'number',
    width: 250,
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
  { field: 'humanTransferSessionId', headerName: '转接的会话ID', width: 200 },
  {
    field: 'transferFromStaffName',
    headerName: '转接来源客服名称',
    width: 200,
  },
  { field: 'transferFromShunt', headerName: '转接来源接待组名称', width: 200 },
  { field: 'transferRemarks', headerName: '转接来源备注', width: 200 },
  // {
  //   field: 'isStaffInvited',
  //   headerName: '客服是否邀请会话',
  //   type: 'boolean',
  //   width: 150,
  // },
  {
    field: 'convType',
    headerName: '会话类型',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '正常会话';
      switch (params.value) {
        case 'OFFLINE_COMMENT': {
          result = '离线留言';
          break;
        }
        case 'QUEUE_TIMEOUT': {
          result = '排队超时';
          break;
        }
        default: {
          result = '正常会话';
          break;
        }
      }
      return result;
    },
  },
  {
    field: 'beginner',
    headerName: '会话发起方',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '客户';
      switch (params.value) {
        case 'STAFF': {
          result = '客服';
          break;
        }
        case 'SYS': {
          result = '系统';
          break;
        }
        default: {
          result = '客户';
          break;
        }
      }
      return result;
    },
  },
  { field: 'relatedId', headerName: '关联会话id', width: 150 },
  {
    field: 'relatedType',
    headerName: '关联会话类型',
    width: 200,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '无关联';
      switch (params.value) {
        case 'FROM_BOT': {
          result = '机器人会话转接人工';
          break;
        }
        case 'FROM_HISTORY': {
          result = '历史会话发起';
          break;
        }
        case 'FROM_STAFF': {
          result = '客服间转接';
          break;
        }
        case 'BE_TAKEN_OVER': {
          result = '被接管';
          break;
        }
        default: {
          break;
        }
      }
      return result;
    },
  },
  { field: 'category', headerName: '会话分类信息', width: 200 },
  { field: 'categoryDetail', headerName: '会话咨询分类明细', width: 250 },
  {
    field: 'closeReason',
    headerName: '会话关闭原因',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '机器人转人工';
      switch (params.value) {
        case 'STAFF_CLOSE': {
          result = '客服关闭';
          break;
        }
        case 'USER_LEFT': {
          result = '访客离开页面失效关闭';
          break;
        }
        case 'USER_TIME_OUT': {
          result = '访客离开超时关闭';
          break;
        }
        case 'USER_OTHER_STAFF': {
          result = '访客申请其他客服关闭';
          break;
        }
        case 'USER_NET_ERROR': {
          result = '网络差客服掉线关闭';
          break;
        }
        case 'TRANSFER': {
          result = '客服转接关闭';
          break;
        }
        case 'ADMIN_TAKE_OVER': {
          result = '管理员接管';
          break;
        }
        case 'USER_CLOSE': {
          result = '访客主动关闭';
          break;
        }
        case 'SYS_CLOSE': {
          result = '系统关闭，静默超时关闭';
          break;
        }
        case 'SYS_TRAN': {
          result = '系统关闭，静默超时关闭';
          break;
        }
        case 'USER_SILENT': {
          result = '访客未说话';
          break;
        }
        case 'USER_QUEUE_TIMEOUT': {
          result = '访客排队超时清队列';
          break;
        }
        case 'USER_QUEUE_LEFT': {
          result = '访客放弃排队';
          break;
        }
        case 'STAFF_OFFLINE': {
          result = '客服离线清队列';
          break;
        }
        case 'BOT_TO_STAFF': {
          result = '机器人转人工';
          break;
        }
        default: {
          break;
        }
      }
      return result;
    },
  },
  // {
  //   field: 'stickDuration',
  //   headerName: '客服置顶时长',
  //   type: 'number',
  //   width: 150,
  // },
  { field: 'remarks', headerName: '会话备注', width: 150 },
  // { field: 'status', headerName: '会话解决状态', width: 200 },
  {
    field: 'roundNumber',
    headerName: '对话回合数',
    type: 'number',
    width: 150,
  },
  { field: 'avgRespDuration', headerName: '客服平均响应时长', width: 200 },
  {
    field: 'valid',
    headerName: '是否有效会话',
    width: 200,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value === 0 ? '无效会话' : '有效会话';
    },
  },
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
  // {
  //   field: 'treatedTime',
  //   headerName: '留言处理时间',
  //   type: 'number',
  //   width: 200,
  // },
  {
    field: 'isEvaluationInvited',
    headerName: '客服是否邀评',
    type: 'boolean',
    width: 200,
  },
  {
    field: 'terminator',
    headerName: '会话中止方',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '客户';
      switch (params.value) {
        case 'STAFF': {
          result = '客服';
          break;
        }
        case 'SYS': {
          result = '系统';
          break;
        }
        default: {
          result = '客户';
          break;
        }
      }
      return result;
    },
  },
];

const dateFnsUtils = new DateFnsUtils();

const defaultValue = {
  keyword: '',
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

type Graphql = SearchConv;

const QUERY_STAFF_INFO = gql`
  ${STAFF_FIELD}
  query StaffInfo {
    allStaff {
      ...staffFields
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

const QUERY = gql`
  ${CONV_PAGE_QUERY}
  query Conversation($conversationFilterInput: ConversationFilterInput!) {
    searchConv(conversationFilter: $conversationFilterInput) {
      ...pageOnSearchHitPage
    }
  }
`;

export default function ChatHistory() {
  const [open, setOpen] = useState(false);
  const [conversationFilterInput, setConversationFilterInput] =
    useState<ConversationFilterInput>(defaultValue);
  const [selectConversation, setSelectConversation] = useState<Conversation>();

  const { onLoadding, onCompleted, onError, onErrorMsg } = useAlert();
  const { loading, data, refetch } = useQuery<Graphql>(QUERY, {
    variables: { conversationFilterInput },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const { data: staffInfo } = useQuery<AllStaffInfo>(QUERY_STAFF_INFO);

  const [exportConversation, { loading: exporting }] =
    useMutation<MutationExportGraphql>(MUTATION_CONV_EXPORT, {
      onCompleted,
      onError,
    });
  if (exporting) {
    onLoadding(loading);
  }

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

  const staffList = staffInfo ? staffInfo?.allStaff : [];
  const staffGroupList = staffInfo ? staffInfo?.allStaffGroup : [];
  const staffShuntList = staffInfo ? staffInfo?.allStaffShunt : [];

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
      label: '一般',
    },
    {
      value: 75,
      label: '比较满意',
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
        <DialogTitle
          style={{ cursor: 'move' }}
          id="draggable-dialog-title"
          onClose={handleClose}
        >
          详细聊天消息
        </DialogTitle>
        <DialogContent>
          {selectConversation && (
            <>
              <DetailTitle conv={selectConversation} />
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
            </>
          )}
        </DialogContent>
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
                defaultValue={false}
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
          Toolbar: CustomerExportGridToolbarCreater({
            refetch: () => {
              refetch();
            },
            exportToExcel: async () => {
              const exportResult = await exportConversation({
                variables: { filter: _.omit(conversationFilterInput, 'page') },
              });
              const filekey = exportResult.data?.exportConversation;
              if (filekey) {
                const url = `${getDownloadS3ChatFilePath()}${filekey}`;
                window.open(url, '_blank');
              } else {
                onErrorMsg('导出失败');
              }
            },
          }),
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
