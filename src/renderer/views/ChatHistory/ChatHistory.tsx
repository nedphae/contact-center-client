/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { gql, useMutation, useQuery } from '@apollo/client';
import DateFnsUtils from '@date-io/date-fns';

import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
} from '@material-ui/data-grid';
import SwipeableViews from 'react-swipeable-views';

import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
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
  useEvalProp,
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
  Slider,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@material-ui/core';
import { AllStaffInfo, STAFF_FIELD } from 'renderer/domain/graphql/Staff';
import { SelectKeyValue } from 'renderer/components/Form/ChipSelect';
import { PageParam } from 'renderer/domain/graphql/Query';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import { Control, Controller } from 'react-hook-form';
import { LazyCustomerInfo } from 'renderer/components/Chat/DetailCard/panel/CustomerInfo';
import { CustomerExportGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import useAlert from 'renderer/hook/alert/useAlert';
import { getDownloadS3ChatFilePath } from 'renderer/config/clientConfig';
import {
  DialogTitle,
  PaperComponent,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import TabPanel from 'renderer/components/Chat/Base/TabPanel';
import UserTrackViewer from 'renderer/components/Chat/DetailCard/panel/UserTrackViewer';
import DetailTitle from './DetailTitle';

const dateFnsUtils = new DateFnsUtils();

function a11yProps(index: number) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

const getDefaultValue = () => {
  return {
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
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [conversationFilterInput, setConversationFilterInput] =
    useState<ConversationFilterInput>(getDefaultValue());
  const [selectConversation, setSelectConversation] = useState<Conversation>();
  const [tabValue, setTabValue] = useState(0);
  const style = {
    minWidth: 'calc(100% / 2)',
  };

  const { onLoadding, onCompleted, onError, onErrorMsg } = useAlert();
  const { loading, data, refetch } = useQuery<Graphql>(QUERY, {
    variables: { conversationFilterInput },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const { data: staffInfo } = useQuery<AllStaffInfo>(QUERY_STAFF_INFO);

  const evalProp = useEvalProp();

  const [exportConversation, { loading: exporting }] =
    useMutation<MutationExportGraphql>(MUTATION_CONV_EXPORT, {
      onCompleted,
      onError,
    });
  if (exporting) {
    onLoadding('Exporting');
  }

  const handleClickOpen = (conversation: Conversation) => {
    setSelectConversation(conversation);
    setOpen(true);
  };

  const handlePageChange = (params: number) => {
    // {page: 0, pageCount: 1, pageSize: 25, paginationMode: "server", rowCount: 9}
    conversationFilterInput.page.page = params;
    setConversationFilterInput(conversationFilterInput);
    refetch({ conversationFilterInput });
  };
  const handlePageSizeChange = (params: number) => {
    conversationFilterInput.page.size = params;
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

  const searchConv = data?.searchConv;
  const rows =
    searchConv && searchConv.content
      ? searchConv.content.map((it) => it.content)
      : [];
  const pageSize = searchConv ? searchConv.size : 20;
  const rowCount = searchConv ? searchConv.totalElements : 0;

  const staffList = staffInfo ? staffInfo?.allStaff : [];
  const staffGroupList = staffInfo ? staffInfo?.allStaffGroup : [];
  const staffShuntList = staffInfo ? staffInfo?.allStaffShunt : [];

  const selectKeyValueList: SelectKeyValue[] = [
    {
      label: t('Staff'),
      name: 'staffIdList',
      selectList: _.zipObject(
        staffList.map((value) => value.id),
        staffList.map((value) => value.nickname)
      ),
      defaultValue: [],
    },
    {
      label: t('Staff Group'),
      name: 'groupIdList',
      selectList: _.zipObject(
        staffGroupList.map((value) => value.id),
        staffGroupList.map((value) => value.groupName)
      ),
      defaultValue: [],
    },
    {
      label: t('Shunt Group'),
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
      label: evalProp.eval_1,
    },
    {
      value: 25,
      label: evalProp.eval_25,
    },

    {
      value: 50,
      label: evalProp.eval_50,
    },
    {
      value: 75,
      label: evalProp.eval_75,
    },
    {
      value: 100,
      label: evalProp.eval_100,
    },
  ];

  const columns: GridColDef[] = [
    // { field: 'id', headerName: t('Id'), width: 90 },
    { field: 'staffId', headerName: t('Staff Id'), width: 150 },
    { field: 'realName', headerName: t('Real name'), width: 150 },
    { field: 'nickname', headerName: t('Nickname'), width: 150 },
    { field: 'userId', headerName: t('CustomerId'), width: 150 },
    { field: 'uid', headerName: t('UID'), width: 150 },
    { field: 'userName', headerName: t('Name'), width: 150 },
    { field: 'country', headerName: t('Country'), width: 150 },
    { field: 'city', headerName: t('City'), width: 150 },
    {
      field: 'startTime',
      headerName: t('Start time'),
      type: 'dateTime',
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value
          ? javaInstant2DateStr(params.value as number)
          : null;
      },
    },
    {
      field: 'clientFirstMessageTime',
      headerName: t('Visitor first message time'),
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value
          ? javaInstant2DateStr(params.value as number)
          : null;
      },
    },
    {
      field: 'staffFirstReplyTime',
      headerName: t('Staff first response time'),
      type: 'dateTime',
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value
          ? javaInstant2DateStr(params.value as number)
          : null;
      },
    },
    {
      field: 'firstReplyCost',
      headerName: t('Staff first response duration'),
      type: 'number',
      width: 200,
    },
    {
      field: 'endTime',
      headerName: t('End Time'),
      type: 'dateTime',
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value
          ? javaInstant2DateStr(params.value as number)
          : null;
      },
    },
    { field: 'fromShuntName', headerName: t('Shunt Name'), width: 150 },
    { field: 'fromGroupName', headerName: t('Staff Group'), width: 150 },
    { field: 'fromIp', headerName: t('Visitor IP'), width: 150 },
    { field: 'fromPage', headerName: t('From Page'), width: 150 },
    { field: 'fromTitle', headerName: t('From Page Title'), width: 150 },
    {
      field: 'fromType',
      headerName: t('From type'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Unknown');
        switch (params.value) {
          case 'WEB': {
            result = t('Web');
            break;
          }
          case 'IOS': {
            result = t('iOS');
            break;
          }
          case 'ANDROID': {
            result = t('Android');
            break;
          }
          case 'WX': {
            result = t('WeChat');
            break;
          }
          case 'WX_MA': {
            result = t('WeChat applet');
            break;
          }
          case 'WB': {
            result = t('Weibo');
            break;
          }
          case 'OPEN': {
            result = t('Open interface');
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
      field: 'evaluate.evaluation',
      headerName: t('User evaluation score'),
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        const evaluate = params.row.evaluate as Evaluate;
        return getEvaluation(evalProp, evaluate?.evaluation);
      },
    },
    {
      field: 'evaluate.evaluationRemark',
      headerName: t('User evaluation content'),
      width: 250,
      valueGetter: (params: GridValueGetterParams) => {
        const evaluate = params.row.evaluate as Evaluate;
        return evaluate?.evaluationRemark;
      },
    },
    {
      field: 'evaluate.userResolvedStatus',
      headerName: t('User marked resolution status'),
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        const evaluate = params.row.evaluate as Evaluate;
        let result = t('Unknown');
        switch (evaluate?.userResolvedStatus) {
          case 1: {
            result = t('Solved');
            break;
          }
          case 2: {
            result = t('Unsolved');
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
      field: 'inQueueTime',
      headerName: t('In queue duration'),
      type: 'number',
      width: 150,
    },
    {
      field: 'interaction',
      headerName: t('Session service type'),
      description: t('Human/Robot Session'),
      sortable: false,
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Bot session');
        if (params.value === 1) {
          result = t('Staff session');
        }
        return result;
      },
    },
    { field: 'vipLevel', headerName: 'VIP', type: 'number', width: 150 },
    {
      field: 'visitRange',
      headerName: t('Time from last visit'),
      type: 'number',
      width: 250,
    },
    {
      field: 'transferType',
      headerName: t('Transfer type'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Unknown');
        switch (params.value) {
          case 'INITIATIVE': {
            result = t('Active to manual');
            break;
          }
          case 'KEYWORD': {
            result = t('keyword to manual');
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
    {
      field: 'humanTransferSessionId',
      headerName: t('The transferred session id'),
      width: 200,
    },
    {
      field: 'transferFromStaffName',
      headerName: t('Transfer source staff name'),
      width: 200,
    },
    {
      field: 'transferFromShunt',
      headerName: t('Transfer source shunt name'),
      width: 200,
    },
    {
      field: 'transferRemarks',
      headerName: t('Transfer Source Notes'),
      width: 200,
    },
    // {
    //   field: 'isStaffInvited',
    //   headerName: '客服是否邀请会话',
    //   type: 'boolean',
    //   width: 150,
    // },
    {
      field: 'convType',
      headerName: t('Session type'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Normal session');
        switch (params.value) {
          case 'OFFLINE_COMMENT': {
            result = t('Offline message');
            break;
          }
          case 'QUEUE_TIMEOUT': {
            result = t('Queuing timeout');
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
      field: 'beginner',
      headerName: t('Session initiator'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Cutsomer');
        switch (params.value) {
          case 'STAFF': {
            result = t('Staff');
            break;
          }
          case 'SYS': {
            result = t('System');
            break;
          }
          default: {
            break;
          }
        }
        return result;
      },
    },
    { field: 'relatedId', headerName: t('Related session id'), width: 150 },
    {
      field: 'relatedType',
      headerName: t('Related session type'),
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('No related');
        switch (params.value) {
          case 'FROM_BOT': {
            result = t('Bot session to human');
            break;
          }
          case 'FROM_HISTORY': {
            result = t('From history session');
            break;
          }
          case 'FROM_STAFF': {
            result = t('Transfer between staff');
            break;
          }
          case 'BE_TAKEN_OVER': {
            result = t('Taken over');
            break;
          }
          default: {
            break;
          }
        }
        return result;
      },
    },
    { field: 'category', headerName: t('Session category'), width: 200 },
    {
      field: 'categoryDetail',
      headerName: t('Session category details'),
      width: 250,
    },
    {
      field: 'closeReason',
      headerName: t('Session close reason'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Robot to Human');
        switch (params.value) {
          case 'STAFF_CLOSE': {
            result = t('Staff closed');
            break;
          }
          case 'USER_LEFT': {
            result = t('The visitor leaves the page invalid close');
            break;
          }
          case 'USER_TIME_OUT': {
            result = t('Visitor leave timeout close');
            break;
          }
          case 'USER_OTHER_STAFF': {
            result = t('Visitors apply for other staff to close');
            break;
          }
          case 'USER_NET_ERROR': {
            result = t('Network error staff dropped and closed');
            break;
          }
          case 'TRANSFER': {
            result = t('Staff transfer is closed');
            break;
          }
          case 'ADMIN_TAKE_OVER': {
            result = t('Admin takes over');
            break;
          }
          case 'USER_CLOSE': {
            result = t('Visitors close');
            break;
          }
          case 'SYS_CLOSE': {
            result = t('System shutdown, ');
            break;
          }
          case 'SYS_TRAN': {
            result = t('Silent timeout shutdown');
            break;
          }
          case 'USER_SILENT': {
            result = t('The visitor did not speak');
            break;
          }
          case 'USER_QUEUE_TIMEOUT': {
            result = t('Visitors queuing timed out and clearing the queue');
            break;
          }
          case 'USER_QUEUE_LEFT': {
            result = t('Visitors abandon the queue');
            break;
          }
          case 'STAFF_OFFLINE': {
            result = t('Staff offline clearing queue');
            break;
          }
          case 'BOT_TO_STAFF': {
            result = t('Robot to Human');
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
    { field: 'remarks', headerName: t('Session remarks'), width: 150 },
    // { field: 'status', headerName: '会话解决状态', width: 200 },
    {
      field: 'roundNumber',
      headerName: t('Dialogue round'),
      type: 'number',
      width: 150,
    },
    {
      field: 'avgRespDuration',
      headerName: t('Average staff response time'),
      width: 200,
    },
    {
      field: 'valid',
      headerName: t('Is a valid session'),
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value === 0 ? t('Invalid session') : t('Valid session');
      },
    },
    {
      field: 'staffMessageCount',
      headerName: t('Number of staff messages'),
      type: 'number',
      width: 150,
    },
    {
      field: 'userMessageCount',
      headerName: t('Visitor messages'),
      type: 'number',
      width: 150,
    },
    {
      field: 'totalMessageCount',
      headerName: t('Total messages'),
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
      headerName: t('Whether staff invites comments'),
      type: 'boolean',
      width: 200,
    },
    {
      field: 'terminator',
      headerName: t('Session terminator party'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Customer');
        switch (params.value) {
          case 'STAFF': {
            result = t('Staff');
            break;
          }
          case 'SYS': {
            result = t('System');
            break;
          }
          default: {
            result = t('');
            break;
          }
        }
        return result;
      },
    },
  ];

  const handleTabValueChange = (
    event: React.ChangeEvent<unknown>,
    newValue: number
  ) => {
    setTabValue(newValue);
    event.preventDefault();
  };
  const handleChangeIndex = (index: number) => {
    setTabValue(index);
  };

  return (
    <div style={{ height: 'calc(100vh - 158px)', width: '100%' }}>
      <Dialog
        disableEnforceFocus
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleDialogClose}
        scroll="paper"
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle
          style={{ cursor: 'move' }}
          id="draggable-dialog-title"
          onClose={handleClose}
        >
          {t('Detailed chat message')}
        </DialogTitle>
        <DialogContent dividers>
          {selectConversation && (
            <>
              <Grid container alignItems="flex-start" justifyContent="center">
                <Grid item xs={8}>
                  <DetailTitle conv={selectConversation} />
                  <MessageList conversation={selectConversation} />
                </Grid>
                <Grid item xs={4}>
                  <div style={{ height: '100%' }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabValueChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      aria-label="scrollable prevent tabs example"
                    >
                      <Tab
                        style={style}
                        label={t('Information')}
                        {...a11yProps(0)}
                      />
                      <Tab style={style} label={t('Track')} {...a11yProps(1)} />
                    </Tabs>
                    <SwipeableViews
                      axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                      index={tabValue}
                      onChangeIndex={handleChangeIndex}
                    >
                      <TabPanel
                        style={{ height: 'calc(100vh - 220px)' }}
                        value={tabValue}
                        index={0}
                      >
                        <LazyCustomerInfo userId={selectConversation.userId} />
                      </TabPanel>
                      <TabPanel
                        style={{ height: 'calc(100vh - 220px)' }}
                        value={tabValue}
                        index={1}
                      >
                        <UserTrackViewer
                          userTrackList={selectConversation.userTrackList}
                        />
                      </TabPanel>
                    </SwipeableViews>
                  </div>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
      </Dialog>
      <SearchForm
        defaultValues={getDefaultValue()}
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
                    label={t('Filter satisfaction range')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={3}>
              <Typography id="range-slider" gutterBottom>
                {t('Satisfaction range')}
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
        localeText={gridLocaleTextMap.get(i18n.language)}
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
                onErrorMsg('Export failed');
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
