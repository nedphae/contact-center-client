import { useState } from 'react';

import { Object } from 'ts-toolbelt';
import _ from 'lodash';
import clsx from 'clsx';
import { gql, useMutation, useQuery } from '@apollo/client';

import DateFnsUtils from '@date-io/date-fns';
import zhCN from 'date-fns/locale/zh-CN';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetterParams,
} from '@material-ui/data-grid';
import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import SearchIcon from '@material-ui/icons/Search';

import GRID_DEFAULT_LOCALE_TEXT from 'renderer/variables/gridLocaleText';
import {
  Card,
  CardActions,
  Checkbox,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  FormControlProps,
  IconButton,
} from '@material-ui/core';
import { CustomerExportGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import { useSearchFormStyles } from 'renderer/components/SearchForm/SearchForm';
import { PageParam, RangeQuery } from 'renderer/domain/graphql/Query';
import { CommentQuery } from 'renderer/domain/Comment';
import { Control, Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import { AllStaffInfo, STAFF_FIELD } from 'renderer/domain/graphql/Staff';
import { SearchHit } from 'renderer/domain/Conversation';
import { PageResult } from 'renderer/domain/Page';
import ChipSelect, {
  SelectKeyValue,
} from 'renderer/components/Form/ChipSelect';
import getPageQuery from 'renderer/domain/graphql/Page';
import useAlert from 'renderer/hook/alert/useAlert';
import { getDownloadS3ChatFilePath } from 'renderer/config/clientConfig';

const columns: GridColDef[] = [
  { field: 'staffId', headerName: '客服ID', width: 150 },
  { field: 'staffName', headerName: '客服名字', width: 150 },
  { field: 'groupId', headerName: '分组ID', width: 150 },
  { field: 'groupName', headerName: '分组名称', width: 150 },
  {
    field: 'date',
    headerName: '统计时间',
    width: 180,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
  {
    field: 'firstLoginTs',
    headerName: '首次登录时间',
    width: 180,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
  {
    field: 'firstOnlineTs',
    headerName: '首次在线时间',
    width: 180,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
  {
    field: 'lastLogoutTs',
    headerName: '最后登出时间',
    width: 180,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
  {
    field: 'lastBusyTs',
    headerName: '最后忙碌时间',
    width: 180,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
  {
    field: 'lastAwayTs',
    headerName: '最后离开时间',
    width: 180,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
  { field: 'loginDuration', headerName: '登录时长(秒)', width: 200 },
  { field: 'onlineDuration', headerName: '在线时长(秒)', width: 200 },
  { field: 'busyDuration', headerName: '忙碌时长(秒)', width: 200 },
  { field: 'busyTimes', headerName: '忙碌次数', width: 200 },
  { field: 'awayDuration', headerName: '离开时长(秒)', width: 200 },
  { field: 'awayTimes', headerName: '离开次数', width: 200 },
];

type StaffInfoGraphql = Object.Omit<AllStaffInfo, 'allStaffShunt'>;
const QUERY_STAFF_INFO = gql`
  ${STAFF_FIELD}
  query StaffWithGroup {
    allStaff {
      ...staffFields
    }
    allStaffGroup {
      id
      organizationId
      groupName
    }
  }
`;

interface StaffAttendance {
  staffId: number;
  staffName: number;
  groupId: number;
  groupName: number;
  date: number;
  firstLoginTs: number;
  firstOnlineTs: number;
  lastLogoutTs: number;
  loginDuration: number;
  onlineDuration: number;
  lastBusyTs: number;
  busyDuration: number;
  busyTimes: number;
  lastAwayTs: number;
  awayDuration: number;
  awayTimes: number;
}

interface StaffAttendanceGraphql {
  searchStaffAttendance: PageResult<SearchHit<StaffAttendance>>;
}

const CONTENT_QUERY = gql`
  fragment staffAttendanceSearchHitContent on StaffAttendanceSearchHit {
    content {
      id
      staffId
      staffName
      groupId
      groupName
      date
      firstLoginTs
      firstOnlineTs
      lastLogoutTs
      loginDuration
      onlineDuration
      lastBusyTs
      busyDuration
      busyTimes
      lastAwayTs
      awayDuration
      awayTimes
    }
    highlightFields
    id
    index
    innerHits
    nestedMetaData
    # score
    sortValues
  }
`;

export const STAFF_ATTENDANCE_PAGE_QUERY = getPageQuery(
  'StaffAttendanceSearchHitPage',
  CONTENT_QUERY,
  'staffAttendanceSearchHitContent'
);

const QUERY = gql`
  ${STAFF_ATTENDANCE_PAGE_QUERY}
  query StaffAttendance($staffAttendanceFilter: StaffAttendanceFilterInput!) {
    searchStaffAttendance(staffAttendanceFilter: $staffAttendanceFilter) {
      ...pageOnStaffAttendanceSearchHitPage
    }
  }
`;

export interface StaffAttendanceFilterInput {
  time?: boolean;

  // 分页参数
  page: PageParam;

  // 客服组
  groupId?: number[];

  // 责任客服
  staffIdList?: number[];

  // 时间区间
  timeRange?: RangeQuery<number | string>;
}

export interface MutationExportGraphql {
  exportStaffAttendance: string;
}

export const MUTATION_STAFF_ATTENDANCE_EXPORT = gql`
  mutation StaffAttendanceExport($filter: StaffAttendanceExportFilterInput!) {
    exportStaffAttendance(staffAttendanceExportFilter: $filter)
  }
`;

const dateFnsUtils = new DateFnsUtils();

const getDefaultValue = () => {
  return {
    page: new PageParam(0, 20, 'DESC', ['date']),
    timeRange: {
      from: dateFnsUtils.format(
        dateFnsUtils.startOfDay(new Date()),
        "yyyy-MM-dd'T'HH:mm:ss.SSSXX",
      ),
      to: dateFnsUtils.format(
        dateFnsUtils.endOfDay(new Date()),
        "yyyy-MM-dd'T'HH:mm:ss.SSSXX",
      ),
    },
  };
};

export default function StaffAttendanceDataGrid() {
  const classes = useSearchFormStyles();
  const [expanded, setExpanded] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  const { onLoadding, onCompleted, onError, onErrorMsg } = useAlert();
  const defaultValue = getDefaultValue();

  const { loading, data, refetch, variables } = useQuery<
    StaffAttendanceGraphql,
  { staffAttendanceFilter: StaffAttendanceFilterInput }
  >(QUERY, {
    variables: { staffAttendanceFilter: defaultValue },
    onError,
  });
  const { data: staffInfo } = useQuery<StaffInfoGraphql>(QUERY_STAFF_INFO);
  const [exportStaffAttendance, { loading: exporting }] =
    useMutation<MutationExportGraphql>(MUTATION_STAFF_ATTENDANCE_EXPORT, {
      onCompleted,
      onError,
    });

  if (exporting) {
    onLoadding(loading);
  }

  const staffList = staffInfo ? staffInfo?.allStaff : [];
  const staffGroupList = staffInfo ? staffInfo?.allStaffGroup : [];

  const selectKeyValueList: SelectKeyValue[] = [
    {
      label: '客服',
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
  ];

  const { handleSubmit, reset, control, getValues, setValue } =
    useForm<StaffAttendanceFilterInput>({
      defaultValues: defaultValue,
      shouldUnregister: true,
    });

  const handleDelete = (
    name: keyof StaffAttendanceFilterInput,
    value: string
  ) => {
    const values = getValues(name) as string[];
    setValue(name, _.remove(values, (v) => v !== value) as any);
  };

  function setAndRefetch(searchParams: StaffAttendanceFilterInput) {
    refetch({ staffAttendanceFilter: searchParams });
  }

  const staffAttendanceQuery = variables?.staffAttendanceFilter ?? defaultValue;

  const handlePageChange = (params: number) => {
    staffAttendanceQuery.page.page = params;
    setAndRefetch(staffAttendanceQuery);
  };
  const handlePageSizeChange = (params: number) => {
    staffAttendanceQuery.page.size = params;
    setAndRefetch(staffAttendanceQuery);
  };
  const result = data?.searchStaffAttendance;
  const rows =
    result && result.content ? result.content.map((it) => it.content) : [];
  const pageSize = result ? result.size : 20;
  const rowCount = result ? result.totalElements : 0;

  const setSearchParams = (searchParams: StaffAttendanceFilterInput) => {
    searchParams.page = staffAttendanceQuery.page;
    setAndRefetch(searchParams);
  };

  const onSubmit: SubmitHandler<CommentQuery> = (form) => {
    if (form.time) {
      setSearchParams(_.omit(form, 'time', '__typename'));
    } else {
      setSearchParams(_.omit(form, 'time', 'timeRange', '__typename'));
    }
  };

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={zhCN}>
        <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          {/* 老式的折叠写法，新的参考 StaffShuntForm */}
          <Card>
            <CardActions disableSpacing>
              <div className={classes.root}>
                <Controller
                  control={control}
                  defaultValue
                  name="time"
                  render={({ field: { onChange, value } }) => (
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                      )}
                      label="时间"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="timeRange.from"
                  render={({ field: { onChange, value } }) => (
                    <KeyboardDateTimePicker
                      disableFuture
                      variant="inline"
                      format="yyyy-MM-dd HH:mm:ss"
                      margin="normal"
                      id="date-picker-inline"
                      label="开始时间"
                      value={value}
                      onChange={(d) => {
                        if (d) {
                          onChange(
                            dateFnsUtils.format(
                              d,
                              "yyyy-MM-dd'T'HH:mm:ss.SSSXX",
                            ),
                          );
                        }
                      }}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="timeRange.to"
                  render={({ field: { onChange, value } }) => (
                    <KeyboardDateTimePicker
                      variant="inline"
                      format="yyyy-MM-dd HH:mm:ss"
                      margin="normal"
                      id="date-picker-inline"
                      label="结束时间"
                      value={value}
                      onChange={(d) => {
                        if (d) {
                          onChange(
                            dateFnsUtils.format(
                              d,
                              "yyyy-MM-dd'T'HH:mm:ss.SSSXX",
                            ),
                          );
                        }
                      }}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                    />
                  )}
                />
              </div>
              <Button
                variant="contained"
                color="secondary"
                className={classes.button}
                startIcon={<RotateLeftIcon />}
                aria-label="reset"
                onClick={() => {
                  reset(defaultValue);
                }}
              >
                重置
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
                startIcon={<SearchIcon />}
                aria-label="submit"
              >
                搜索
              </Button>
              <IconButton
                className={clsx(classes.expand, {
                  [classes.expandOpen]: expanded,
                })}
                onClick={() => {
                  setExpanded(!expanded);
                }}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </IconButton>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <CardActions>
                <ChipSelect
                  selectKeyValueList={selectKeyValueList}
                  control={
                    control as unknown as Control<
                      Record<string, unknown>,
                      unknown
                    >
                  }
                  handleDelete={
                    handleDelete as (name: string, value: string) => void
                  }
                  CustomerFormControl={(formControlProps: FormControlProps) => (
                    <FormControl
                      className={classes.formControl}
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...formControlProps}
                    />
                  )}
                />
              </CardActions>
            </Collapse>
          </Card>
        </form>
      </MuiPickersUtilsProvider>
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
              const exportResult = await exportStaffAttendance({
                variables: { filter: _.omit(staffAttendanceQuery, 'page') },
              });
              const filekey = exportResult.data?.exportStaffAttendance;
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
        rowsPerPageOptions={[10, 20, 50, 100]}
        paginationMode="server"
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        disableSelectionOnClick
        checkboxSelection
        onSelectionModelChange={(selectionId: GridRowId[]) => {
          setSelectionModel(selectionId);
        }}
        selectionModel={selectionModel}
      />
    </div>
  );
}
