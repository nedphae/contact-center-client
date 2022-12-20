import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { gql, useMutation, useQuery } from '@apollo/client';

import { DataGrid, GridColDef, GridRowId } from '@material-ui/data-grid';

import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
import { QUERY_GROUP, StaffGroupList } from 'renderer/domain/graphql/Staff';
import { StaffGroup } from 'renderer/domain/StaffInfo';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import StaffGroupForm from 'renderer/components/StaffForm/StaffGroupForm';
import { CustomerGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import useAlert from 'renderer/hook/alert/useAlert';

const MUTATION_GROUP = gql`
  mutation DeleteGroup($ids: [Long!]!) {
    deleteStaffGroupByIds(ids: $ids)
  }
`;

type Graphql = StaffGroupList;

export default function Group() {
  const [staffGroup, setStaffGroup] = useState<StaffGroup | undefined>(
    undefined
  );
  const { t, i18n } = useTranslation();
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

  async function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      await deleteByIds({ variables: { ids: selectionModel } });
      refetch();
    }
  }

  const columns: GridColDef[] = [
    // { field: 'id', headerName: 'ID', width: 90 },
    { field: 'groupName', headerName: t('Group Name'), width: 150 },
  ];

  return (
    <>
      <DraggableDialog title={t('Add/Modify staff group')} ref={refOfDialog}>
        <StaffGroupForm defaultValues={staffGroup} refetch={refetch} />
      </DraggableDialog>
      <DataGrid
        localeText={gridLocaleTextMap.get(i18n.language)}
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
