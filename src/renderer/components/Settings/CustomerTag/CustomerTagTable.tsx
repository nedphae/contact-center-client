import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import _ from 'lodash';
import { useMutation, useQuery } from '@apollo/client';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowId,
} from '@material-ui/data-grid';
import ColorLensIcon from '@material-ui/icons/ColorLens';
import { Chip } from '@material-ui/core';

import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
import { CustomerGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import useAlert from 'renderer/hook/alert/useAlert';
import {
  CustomerTagGraphql,
  MUTATION_DELETE_CUSTOMER_TAG,
  QUERY_CUSTOMER_TAG,
} from 'renderer/domain/graphql/Customer';
import { CustomerTag } from 'renderer/domain/Customer';
import CustomerTagForm from './CustomerTagForm';

export default function CustomerTagTable() {
  const { t, i18n } = useTranslation();

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
    onLoadding('Deleting');
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

  const columns: GridColDef[] = [
    // { field: 'id', headerName: t('tag.Id'), width: 90 },
    { field: 'name', headerName: t('tag.Name'), width: 150 },
    {
      field: 'color',
      headerName: t('tag.Color'),
      width: 150,
      renderCell: function ColorIcon(params: GridCellParams) {
        const { value: colorHex } = params;
        return <ColorLensIcon style={{ color: colorHex as string }} />;
      },
    },
    {
      field: 'dispaly',
      headerName: t('tag.Display'),
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

  return (
    <>
      <DraggableDialog title={t('Customer Tag')} ref={refOfDialog}>
        <CustomerTagForm
          defaultValues={customerTag}
          refetch={() => {
            refetch();
            // refOfDialog.current?.setOpen(false);
          }}
        />
      </DraggableDialog>
      <DataGrid
        localeText={gridLocaleTextMap.get(i18n.language)}
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
