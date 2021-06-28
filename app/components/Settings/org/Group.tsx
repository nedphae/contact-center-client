import React from 'react';

import { gql, useQuery } from '@apollo/client';

import { StaffGroup } from 'app/domain/StaffInfo';
import { DataGrid, GridColDef, GridToolbar } from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';

const GROUP_QUERY = gql`
  query Group {
    allStaffGroup {
      id
      organizationId
      groupName
    }
  }
`;

interface Graphql {
  allStaffGroup: StaffGroup[];
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'groupName', headerName: '组名', width: 150 },
];

export default function Group() {
  const { loading, data } = useQuery<Graphql>(GROUP_QUERY);
  const rows = data?.allStaffGroup ?? [];

  return (
    <DataGrid
      localeText={GRID_DEFAULT_LOCALE_TEXT}
      rows={rows}
      columns={columns}
      components={{
        // TODO: 自定义分组
        Toolbar: GridToolbar,
      }}
      pagination
      pageSize={20}
      loading={loading}
      disableSelectionOnClick
    />
  );
}
