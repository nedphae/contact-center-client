import React, { useRef, useState } from 'react';

import { gql, useQuery } from '@apollo/client';

import { DataGrid, GridColDef } from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { StaffGroupList } from 'app/domain/graphql/Staff';
import { StaffGroup } from 'app/domain/StaffInfo';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StaffGroupForm from 'app/components/StaffForm/StaffGroupForm';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';

const QUERY_GROUP = gql`
  query Group {
    allStaffGroup {
      id
      organizationId
      groupName
    }
  }
`;

type Graphql = StaffGroupList;

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'groupName', headerName: '组名', width: 150 },
];

export default function Group() {
  const [staffGroup, setStaffGroup] = useState<StaffGroup | undefined>(
    undefined
  );
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const { loading, data } = useQuery<Graphql>(QUERY_GROUP);

  function newButtonClick() {
    setStaffGroup(undefined);
    refOfDialog.current?.setOpen(true);
  }

  const handleClickOpen = (selectStaffGroup: StaffGroup) => {
    setStaffGroup(selectStaffGroup);
    refOfDialog.current?.setOpen(true);
  };

  const rows = data?.allStaffGroup ?? [];

  return (
    <>
      <DraggableDialog title="添加/修改客服组" ref={refOfDialog}>
        <StaffGroupForm defaultValues={staffGroup} />
      </DraggableDialog>
      <DataGrid
        localeText={GRID_DEFAULT_LOCALE_TEXT}
        rows={rows}
        columns={columns}
        components={{
          Toolbar: CustomerGridToolbarCreater({ newButtonClick }),
        }}
        onRowClick={(param) => {
          handleClickOpen(param.row as StaffGroup);
        }}
        pagination
        pageSize={20}
        loading={loading}
        disableSelectionOnClick
      />
    </>
  );
}
