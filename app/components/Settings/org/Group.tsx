import React, { useRef, useState } from 'react';

import { gql, useMutation, useQuery } from '@apollo/client';

import { DataGrid, GridColDef, GridRowId } from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { QUERY_GROUP, StaffGroupList } from 'app/domain/graphql/Staff';
import { StaffGroup } from 'app/domain/StaffInfo';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StaffGroupForm from 'app/components/StaffForm/StaffGroupForm';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import useAlert from 'app/hook/alert/useAlert';

const MUTATION_GROUP = gql`
  mutation DeleteGroup($ids: [Long!]!) {
    deleteStaffGroupByIds(ids: $ids)
  }
`;

type Graphql = StaffGroupList;

const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 90 },
  { field: 'groupName', headerName: '组名', width: 150 },
];

export default function Group() {
  const [staffGroup, setStaffGroup] = useState<StaffGroup | undefined>(
    undefined
  );
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY_GROUP);

  const { onLoadding, onCompleted, onError } = useAlert();
  const [deleteByIds, { loading: deleteLoading }] = useMutation<number>(
    MUTATION_GROUP,
    {
      onCompleted,
      onError,
    }
  );
  if (deleteLoading) {
    onLoadding(deleteLoading);
  }

  function newButtonClick() {
    setStaffGroup(undefined);
    refOfDialog.current?.setOpen(true);
  }

  const handleClickOpen = (selectStaffGroup: StaffGroup) => {
    setStaffGroup(selectStaffGroup);
    refOfDialog.current?.setOpen(true);
  };

  const rows = data?.allStaffGroup ?? [];

  function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      deleteByIds({ variables: { ids: selectionModel } });
    }
  }

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
          Toolbar: CustomerGridToolbarCreater({
            newButtonClick,
            deleteButtonClick,
            refetch: () => {
              refetch();
            },
          }),
        }}
        onRowClick={(param) => {
          handleClickOpen(param.row as StaffGroup);
        }}
        rowsPerPageOptions={[20]}
        pagination
        pageSize={20}
        loading={loading}
        disableSelectionOnClick
        checkboxSelection
        onSelectionModelChange={(selectionId: GridRowId[]) => {
          setSelectionModel(selectionId);
        }}
        selectionModel={selectionModel}
      />
    </>
  );
}
