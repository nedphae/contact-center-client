import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutation, useQuery, useLazyQuery } from '@apollo/client';

import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridValueGetterParams,
} from '@material-ui/data-grid';
import Button from '@material-ui/core/Button';

import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
import { CustomerGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import { useSearchFormStyles } from 'renderer/components/SearchForm/SearchForm';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
import {
  BlacklistGraphql,
  DeleteBlacklistGraphql,
  MUTATION_DELETE_BLACKLIST,
  QUERY_BLACKLISTT,
} from 'renderer/domain/graphql/Blacklist';
import useAlert from 'renderer/hook/alert/useAlert';
import {
  QUERY_STAFF_LIST_BY_IDS,
  StaffListByIds,
} from 'renderer/domain/graphql/Staff';
import { Blacklist } from 'renderer/domain/Blacklist';

export default function BlacklistView() {
  const classes = useSearchFormStyles();
  const { t, i18n } = useTranslation();

  const [rows, setRows] = useState<Blacklist[]>([]);
  const { loading, data, refetch } = useQuery<BlacklistGraphql>(
    QUERY_BLACKLISTT,
    {
      variables: { audited: true },
    },
  );

  const [getStaffByIds, { data: staffList }] = useLazyQuery<StaffListByIds>(
    QUERY_STAFF_LIST_BY_IDS,
  );

  const { onLoadding, onCompleted, onError } = useAlert();
  const [deleteBlacklist, { loading: deleteLoading }] =
    useMutation<DeleteBlacklistGraphql>(MUTATION_DELETE_BLACKLIST, {
      onCompleted,
      onError,
    });
  if (deleteLoading) {
    onLoadding('Deleting');
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
            (staff) => staff.id === row.staffId,
          )?.realName,
        })),
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
          {t('Delete')}
        </Button>
      );
    }
    return [
      {
        field: 'preventStrategy',
        headerName: t('block-list.Block list type'),
        width: 150,
      },
      {
        field: 'preventSource',
        headerName: t('block-list.Block target'),
        width: 150,
      },
      {
        field: 'staffName',
        headerName: t('block-list.Operating staff'),
        width: 150,
      },
      {
        field: 'effectiveTime',
        headerName: t('block-list.Validity start time'),
        width: 180,
        valueGetter: (params: GridValueGetterParams) => {
          return params.value
            ? javaInstant2DateStr(new Date(params.value as number))
            : null;
        },
      },
      {
        field: 'failureTime',
        headerName: t('block-list.Validity end time'),
        width: 180,
        valueGetter: (params: GridValueGetterParams) => {
          return params.value
            ? javaInstant2DateStr(new Date(params.value as number))
            : null;
        },
      },
      {
        field: 'button',
        headerName: t('Operate'),
        minWidth: 150,
        renderCell: DeleteButton,
      },
    ] as GridColDef[];
  }, [classes.button, deleteBlacklist, refetch, t]);

  return (
    <div style={{ height: 'calc(100vh - 70px)', width: '100%' }}>
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
        paginationMode="client"
        loading={loading}
        disableSelectionOnClick
      />
    </div>
  );
}
