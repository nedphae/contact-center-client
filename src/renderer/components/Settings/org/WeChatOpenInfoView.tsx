import { useRef, useState } from 'react';

import { gql, useMutation, useQuery } from '@apollo/client';

import { DataGrid, GridColDef, GridRowId } from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'renderer/variables/gridLocaleText';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import { CustomerGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import useAlert from 'renderer/hook/alert/useAlert';
import {
  QUERY_WECHAT_INFO,
  WeChatOpenInfo,
  WeChatOpenInfoGraphql,
} from 'renderer/domain/WeChatOpenInfo';
import WeChatOpenInfoForm from './form/WeChatOpenInfoForm';

const MUTATION_GROUP = gql`
  mutation DeleteGroup($ids: [Long!]!) {
    deleteStaffGroupByIds(ids: $ids)
  }
`;

type Graphql = WeChatOpenInfoGraphql;

const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 90 },
  { field: 'groupName', headerName: '组名', width: 150 },
  { field: 'groupName', headerName: '组名', width: 150 },
  { field: 'groupName', headerName: '组名', width: 150 },
  { field: 'groupName', headerName: '组名', width: 150 },
  { field: 'groupName', headerName: '组名', width: 150 },
  { field: 'groupName', headerName: '组名', width: 150 },
];

export default function WeChatOpenInfoView() {
  const [weChatOpenInfo, setWeChatOpenInfo] = useState<WeChatOpenInfo>();
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY_WECHAT_INFO);

  const { onLoadding, onCompleted, onError } = useAlert();
  const [deleteByIds, { loading: deleteLoading }] = useMutation<number>(
    MUTATION_GROUP,
    {
      onCompleted,
      onError,
    },
  );
  if (deleteLoading) {
    onLoadding(deleteLoading);
  }

  function newButtonClick() {
    setWeChatOpenInfo(undefined);
    refOfDialog.current?.setOpen(true);
  }

  const handleClickOpen = (selectWeChatOpenInfo: WeChatOpenInfo) => {
    setWeChatOpenInfo(selectWeChatOpenInfo);
    refOfDialog.current?.setOpen(true);
  };

  const rows = data?.getAllWeChatOpenInfo ?? [];

  async function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      await deleteByIds({ variables: { ids: selectionModel } });
      refetch();
    }
  }

  return (
    <>
      <DraggableDialog title="关联接待组" ref={refOfDialog}>
        <WeChatOpenInfoForm defaultValues={weChatOpenInfo} refetch={refetch} />
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
          handleClickOpen(param.row as WeChatOpenInfo);
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
