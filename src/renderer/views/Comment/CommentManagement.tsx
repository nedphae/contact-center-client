import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
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

type Graphql = CommentGraphql;
const QUERY = QUERY_COMMENT;

const dateFnsUtils = new DateFnsUtils();

const getDefaultValue = () => {
  return {
    solved: 0,
    page: new PageParam(),
    timeRange: {
      from: dateFnsUtils.format(
        dateFnsUtils.startOfMonth(new Date()),
        "yyyy-MM-dd'T'HH:mm:ss.SSSXX",
      ),
      to: dateFnsUtils.format(
        dateFnsUtils.endOfDay(new Date()),
        "yyyy-MM-dd'T'HH:mm:ss.SSSXX",
      ),
    },
  };
};

export default function CommentManagement() {
  const classes = useSearchFormStyles();
  const { t, i18n } = useTranslation();

  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectCommentPojo, setSelectCommentPojo] = useState<CommentPojo>();
  const [commentQuery, setCommentQuery] = useState<CommentQuery>(
    getDefaultValue(),
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
  const findComment = data?.findComment;
  const rows = findComment && findComment.content ? findComment.content : [];
  const pageSize = findComment ? findComment.size : 20;
  const rowCount = findComment ? findComment.totalElements : 0;

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

  const columns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: t('Created Date'),
      width: 180,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value
          ? javaInstant2DateStr(params.value as number)
          : null;
      },
    },
    { field: 'shuntId', headerName: t('Shunt'), width: 150 },
    { field: 'userId', headerName: t('CustomerId'), width: 150 },
    { field: 'uid', headerName: t('UID'), width: 150 },
    { field: 'name', headerName: t('Name'), width: 150 },
    { field: 'mobile', headerName: t('Mobile'), width: 150 },
    { field: 'email', headerName: t('Email'), width: 150 },
    { field: 'message', headerName: t('Message content'), width: 350 },
    {
      field: 'solved',
      headerName: t('Solved Status'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Other');
        switch (params.value) {
          case 0: {
            result = t('Unsolved');
            break;
          }
          case 1: {
            result = t('Solved');
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
      headerName: t('Solution'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Other');
        switch (params.value) {
          case 0: {
            result = t('Mobile');
            break;
          }
          case 1: {
            result = t('Email');
            break;
          }
          default: {
            break;
          }
        }
        return result;
      },
    },
    { field: 'fromPage', headerName: t('From Page'), width: 150 },
    { field: 'fromIp', headerName: t('Visitor IP'), width: 150 },
    { field: 'solvedMsg', headerName: t('Solution content'), width: 150 },
  ];

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <DraggableDialog title={t('Detailed message')} ref={refOfDialog}>
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
                      control={(
                        <Checkbox
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                      )}
                      label={t('Time Range')}
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
                      label={t('Start time')}
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
                      label={t('End Time')}
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
                  name="solved"
                  render={({ field: { onChange, value } }) => (
                    <FormControl variant="outlined" margin="normal">
                      <InputLabel id="demo-mutiple-chip-label">
                        {t('Solved Status')}
                      </InputLabel>
                      <Select
                        labelId="solved"
                        id="solved"
                        onChange={(event) => {
                          const tempId = event.target.value as string;
                          onChange(tempId === '' ? null : +tempId);
                        }}
                        value={_.isNil(value) ? '' : value}
                        label={t('Solved Status')}
                      >
                        <MenuItem value="">
                          <em>{t('All')}</em>
                        </MenuItem>
                        <MenuItem value="0">{t('Unsolved')}</MenuItem>
                        <MenuItem value="1">{t('Solved')}</MenuItem>
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
                      {t('Solution')}
                      </InputLabel>
                      <Select
                        labelId="solvedWay"
                        id="solvedWay"
                        onChange={(event) => {
                          const tempId = event.target.value as string;
                          onChange(tempId === '' ? null : +tempId);
                        }}
                        value={_.isNil(value) ? '' : value}
                        label={t('Solution')}
                      >
                        <MenuItem value="">
                          <em>{t('All')}</em>
                        </MenuItem>
                        <MenuItem value={0}>{t('Mobile')}</MenuItem>
                        <MenuItem value={1}>{t('Email')}</MenuItem>
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
                {t('Reset')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
                startIcon={<SearchIcon />}
                aria-label="submit"
              >
                {t('Search')}
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
        localeText={gridLocaleTextMap.get(i18n.language)}
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
