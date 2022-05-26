import React, { useRef, useState } from 'react';

import _ from 'lodash';
import { gql, useMutation, useQuery } from '@apollo/client';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowId,
} from '@material-ui/data-grid';
import ColorLensIcon from '@material-ui/icons/ColorLens';
import { Chip } from '@material-ui/core';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import useAlert from 'app/hook/alert/useAlert';
import {
  CustomerTagGraphql,
  MUTATION_DELETE_CUSTOMER_TAG,
  QUERY_CUSTOMER_TAG,
} from 'app/domain/graphql/Customer';
import { CustomerTag } from 'app/domain/Customer';
import CustomerTagForm from './CustomerTagForm';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: '标签名称', width: 150 },
  {
    field: 'color',
    headerName: '颜色',
    width: 150,
    renderCell: function ColorIcon(params: GridCellParams) {
      const { value: colorHex } = params;
      return <ColorLensIcon style={{ color: colorHex as string }} />;
    },
  },
  {
    field: 'dispaly',
    headerName: '展示效果',
    width: 150,
    renderCell: function ColorIcon(params: GridCellParams) {
      const {
        row: { color: colorHex, name },
      } = params;
      return (
        <Chip
          size="small"
          color="secondary"
          label={name}
          style={{ backgroundColor: colorHex as string }}
          onDelete={() => {}}
        />
      );
    },
  },
];

export default function CustomerTagTable() {
  const { loading, data, refetch } =
    useQuery<CustomerTagGraphql>(QUERY_CUSTOMER_TAG);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [customerTag, setCustomerTag] = useState<CustomerTag>();
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  const { onLoadding, onCompleted, onError } = useAlert();
  const [deleteTagsByIds, { loading: updateLoading }] = useMutation<unknown>(
    MUTATION_DELETE_CUSTOMER_TAG,
    {
      onCompleted,
      onError,
    }
  );
  if (updateLoading) {
    onLoadding(updateLoading);
  }

  const rows = data?.getAllCustomerTag ?? [];

  function newButtonClick() {
    setCustomerTag(undefined);
    refOfDialog.current?.setOpen(true);
  }

  const handleClickOpen = (selectCustomerTag: CustomerTag) => {
    setCustomerTag(selectCustomerTag);
    refOfDialog.current?.setOpen(true);
  };

  async function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      await deleteTagsByIds({ variables: { ids: selectionModel } });
      refetch();
    }
  }

  return (
    <>
      <DraggableDialog title="客户标签" ref={refOfDialog}>
        <CustomerTagForm
          defaultValues={customerTag}
          refetch={() => {
            refetch();
            // refOfDialog.current?.setOpen(false);
          }}
        />
      </DraggableDialog>
      <DataGrid
        localeText={GRID_DEFAULT_LOCALE_TEXT}
        rows={rows}
        columns={columns}
        components={{
          // TODO: 自定义分组
          Toolbar: CustomerGridToolbarCreater({
            newButtonClick,
            deleteButtonClick,
            refetch: () => {
              refetch();
            },
          }),
        }}
        onRowClick={(param) => {
          handleClickOpen(param.row as CustomerTag);
        }}
        pagination
        rowsPerPageOptions={[10, 20, 50, 100]}
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
