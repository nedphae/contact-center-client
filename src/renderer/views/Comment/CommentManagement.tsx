import { useRef, useState } from 'react';

import _ from 'lodash';
import clsx from 'clsx';
import { useQuery } from '@apollo/client';

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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import { CustomerGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import { useSearchFormStyles } from 'renderer/components/SearchForm/SearchForm';
import { PageParam } from 'renderer/domain/graphql/Query';
import { CommentGraphql, QUERY_COMMENT } from 'renderer/domain/graphql/Comment';
import { CommentPojo, CommentQuery } from 'renderer/domain/Comment';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import CommentForm from 'renderer/components/CommentManagement/CommentForm';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';

const columns: GridColDef[] = [
  {
    field: 'createdAt',
    headerName: '创建时间',
    width: 180,
    valueGetter: (params: GridValueGetterParams) => {
      return params.value ? javaInstant2DateStr(params.value as number) : null;
    },
  },
  { field: 'shuntId', headerName: '接待组', width: 150 },
  { field: 'userId', headerName: '用户ID', width: 150 },
  { field: 'uid', headerName: '用户标识', width: 150 },
  { field: 'name', headerName: '用户姓名', width: 150 },
  { field: 'mobile', headerName: '手机', width: 150 },
  { field: 'email', headerName: '邮箱', width: 150 },
  { field: 'message', headerName: '留言内容', width: 350 },
  {
    field: 'solved',
    headerName: '解决状态',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '其他';
      switch (params.value) {
        case 0: {
          result = '未解决';
          break;
        }
        case 1: {
          result = '已解决';
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
    field: 'solvedWay',
    headerName: '解决方式',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '其他';
      switch (params.value) {
        case 0: {
          result = '手机';
          break;
        }
        case 1: {
          result = '邮件';
          break;
        }
        default: {
          break;
        }
      }
      return result;
    },
  },
  { field: 'fromPage', headerName: '来源页', width: 150 },
  { field: 'fromIp', headerName: '来源IP', width: 150 },
  { field: 'solvedMsg', headerName: '处理内容', width: 150 },
];

type Graphql = CommentGraphql;
const QUERY = QUERY_COMMENT;

const dateFnsUtils = new DateFnsUtils();

const getDefaultValue = () => {
  return {
    solved: 0,
    page: new PageParam(0, 20, 'DESC', ['created_at']),
    timeRange: {
      from: dateFnsUtils.format(
        dateFnsUtils.startOfMonth(new Date()),
        "yyyy-MM-dd'T'HH:mm:ss.SSSXX"
      ),
      to: dateFnsUtils.format(
        dateFnsUtils.endOfDay(new Date()),
        "yyyy-MM-dd'T'HH:mm:ss.SSSXX"
      ),
    },
  };
};

export default function CommentManagement() {
  const classes = useSearchFormStyles();
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectCommentPojo, setSelectCommentPojo] = useState<CommentPojo>();
  const [commentQuery, setCommentQuery] = useState<CommentQuery>(
    getDefaultValue()
  );
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY, {
    variables: { commentQuery },
  });
  const { handleSubmit, reset, control } = useForm<CommentQuery>({
    defaultValues: commentQuery,
    shouldUnregister: true,
  });

  function setAndRefetch(searchParams: CommentQuery) {
    setCommentQuery(searchParams);
    refetch({ commentQuery: searchParams });
  }

  const handleClickOpen = (commentPojo: CommentPojo) => {
    setSelectCommentPojo(commentPojo);
    refOfDialog.current?.setOpen(true);
  };

  const handlePageChange = (params: number) => {
    commentQuery.page.page = params;
    setAndRefetch(commentQuery);
  };
  const handlePageSizeChange = (params: number) => {
    commentQuery.page.size = params;
    setAndRefetch(commentQuery);
  };
  const result = data?.findComment;
  const rows = result && result.content ? result.content : [];
  const pageSize = result ? result.size : 20;
  const rowCount = result ? result.totalElements : 0;

  const setSearchParams = (searchParams: CommentQuery) => {
    searchParams.page = commentQuery.page;
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
      <DraggableDialog title="详细留言信息" ref={refOfDialog}>
        <CommentForm defaultValues={selectCommentPojo} />
      </DraggableDialog>
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
                      control={
                        <Checkbox
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                      }
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
                              "yyyy-MM-dd'T'HH:mm:ss.SSSXX"
                            )
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
                              "yyyy-MM-dd'T'HH:mm:ss.SSSXX"
                            )
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
                  name="solved"
                  render={({ field: { onChange, value } }) => (
                    <FormControl variant="outlined" margin="normal">
                      <InputLabel id="demo-mutiple-chip-label">
                        解决状态
                      </InputLabel>
                      <Select
                        labelId="solved"
                        id="solved"
                        onChange={(event) => {
                          const tempId = event.target.value as string;
                          onChange(tempId === '' ? null : +tempId);
                        }}
                        value={_.isNil(value) ? '' : value}
                        label="解决状态"
                      >
                        <MenuItem value="">
                          <em>全部</em>
                        </MenuItem>
                        <MenuItem value="0">未解决</MenuItem>
                        <MenuItem value="1">已解决</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                <Controller
                  control={control}
                  name="solvedWay"
                  render={({ field: { onChange, value } }) => (
                    <FormControl variant="outlined" margin="normal">
                      <InputLabel id="demo-mutiple-chip-label">
                        解决方式
                      </InputLabel>
                      <Select
                        labelId="solvedWay"
                        id="solvedWay"
                        onChange={(event) => {
                          const tempId = event.target.value as string;
                          onChange(tempId === '' ? null : +tempId);
                        }}
                        value={_.isNil(value) ? '' : value}
                        label="解决方式"
                      >
                        <MenuItem value="">
                          <em>全部</em>
                        </MenuItem>
                        <MenuItem value={0}>手机</MenuItem>
                        <MenuItem value={1}>邮件</MenuItem>
                      </Select>
                    </FormControl>
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
                  reset(getDefaultValue());
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
              <CardActions />
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
          Toolbar: CustomerGridToolbarCreater({
            refetch: () => {
              refetch();
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
        onRowClick={(param) => {
          handleClickOpen(param.row as CommentPojo);
        }}
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
