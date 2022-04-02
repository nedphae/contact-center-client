import React, { useEffect, useMemo, useState } from 'react';

import { useMutation, useQuery, useLazyQuery } from '@apollo/client';

import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridValueGetterParams,
} from '@material-ui/data-grid';
import Button from '@material-ui/core/Button';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import { useSearchFormStyles } from 'app/components/SearchForm/SearchForm';
import javaInstant2DateStr from 'app/utils/timeUtils';
import {
  BlacklistGraphql,
  DeleteBlacklistGraphql,
  MUTATION_DELETE_BLACKLIST,
  QUERY_BLACKLISTT,
} from 'app/domain/graphql/Blacklist';
import useAlert from 'app/hook/alert/useAlert';
import {
  QUERY_STAFF_LIST_BY_IDS,
  StaffListByIds,
} from 'app/domain/graphql/Staff';
import { Blacklist } from 'app/domain/Blacklist';

export default function BlacklistView() {
  const classes = useSearchFormStyles();
  const [rows, setRows] = useState<Blacklist[]>([]);
  const { loading, data, refetch } = useQuery<BlacklistGraphql>(
    QUERY_BLACKLISTT,
    {
      variables: { audited: true },
    }
  );

  const [getStaffByIds, { data: staffList }] = useLazyQuery<StaffListByIds>(
    QUERY_STAFF_LIST_BY_IDS
  );

  const { onLoadding, onCompleted, onError } = useAlert();
  const [deleteBlacklist, { loading: deleteLoading }] =
    useMutation<DeleteBlacklistGraphql>(MUTATION_DELETE_BLACKLIST, {
      onCompleted,
      onError,
    });
  if (deleteLoading) {
    onLoadding(deleteLoading);
  }

  useEffect(() => {
    if (data && data.getAllBlacklist.length > 0) {
      setRows(data.getAllBlacklist);
      const staffIds = data.getAllBlacklist.map((row) => row.staffId);
      getStaffByIds({ variables: { staffIds } });
    }
  }, [data, getStaffByIds]);

  useEffect(() => {
    if (staffList && staffList.getStaffByIds.length > 0) {
      setRows((it) =>
        it.map((row) => ({
          ...row,
          staffName: staffList.getStaffByIds.find(
            (staff) => staff.id === row.staffId
          )?.realName,
        }))
      );
    }
  }, [staffList]);

  const pageSize = 20;
  const rowCount = rows.length;

  const columns: GridColDef[] = useMemo(() => {
    function DeleteButton(params: GridCellParams) {
      const {
        row: { preventStrategy, preventSource },
      } = params;
      return (
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          aria-label="delete"
          onClick={async () => {
            await deleteBlacklist({
              variables: {
                blacklist: [{ preventStrategy, preventSource }],
              },
            });
            refetch();
          }}
        >
          删除
        </Button>
      );
    }
    return [
      { field: 'preventStrategy', headerName: '黑名单类型', width: 150 },
      { field: 'preventSource', headerName: '黑名单对象', width: 150 },
      { field: 'staffName', headerName: '操作客服', width: 150 },
      {
        field: 'effectiveTime',
        headerName: '有效期开始时间',
        width: 180,
        valueGetter: (params: GridValueGetterParams) => {
          return params.value
            ? javaInstant2DateStr(new Date(params.value as number))
            : null;
        },
      },
      {
        field: 'failureTime',
        headerName: '有效期结束时间',
        width: 180,
        valueGetter: (params: GridValueGetterParams) => {
          return params.value
            ? javaInstant2DateStr(new Date(params.value as number))
            : null;
        },
      },
      {
        field: 'button',
        headerName: '操作',
        minWidth: 150,
        renderCell: DeleteButton,
      },
    ] as GridColDef[];
  }, [classes.button, deleteBlacklist, refetch]);

  return (
    <div style={{ height: '80vh', width: '100%' }}>
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
        paginationMode="client"
        loading={loading}
        disableSelectionOnClick
      />
    </div>
  );
}
