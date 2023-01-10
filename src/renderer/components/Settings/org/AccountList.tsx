import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import _ from 'lodash';
import { useMutation, useQuery } from '@apollo/client';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetterParams,
} from '@material-ui/data-grid';

import {
  QUERY_GROUP,
  QUERY_STAFF,
  StaffGroupList,
  AllStaffList,
  MUTATION_DELETE_STAFF,
} from 'renderer/domain/graphql/Staff';
import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
import { CustomerGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import StaffForm from 'renderer/components/StaffForm/StaffForm';
import Staff from 'renderer/domain/StaffInfo';
import useAlert from 'renderer/hook/alert/useAlert';

type Graphql = AllStaffList;

const defaultStaff = { staffType: 1 } as Staff;

export default function ist() {
  const { t, i18n } = useTranslation();

  const { loading, data, refetch } = useQuery<Graphql>(QUERY_STAFF);
  const { data: groupList } = useQuery<StaffGroupList>(QUERY_GROUP);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [staff, setStaff] = useState<Staff>(defaultStaff);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  const { onLoadding, onCompleted, onError, onErrorMsg } = useAlert();
  const [deleteStaffByIds, { loading: updateLoading }] = useMutation<unknown>(
    MUTATION_DELETE_STAFF,
    {
      onCompleted,
      onError,
    },
  );
  if (updateLoading) {
    onLoadding(updateLoading);
  }

  const groupMap = _.groupBy(groupList?.allStaffGroup ?? [], (it) => it.id);
  const rows = [...(data?.allStaff ?? [])].map((it) => {
    const itGroup = groupMap[it.groupId];
    if (itGroup && itGroup.length > 0) {
      return _.assign(
        {
          groupName: itGroup[0]?.groupName,
        },
        it,
      );
    }
    return it;
  });

  function newButtonClick() {
    setStaff(defaultStaff);
    refOfDialog.current?.setOpen(true);
  }

  const handleClickOpen = (selectStaff: Staff) => {
    setStaff(selectStaff);
    refOfDialog.current?.setOpen(true);
  };

  function deleteButtonClick() {
    const botMap = _.groupBy(
      rows.filter((it) => it.staffType === 0),
      (it) => it.id,
    );
    const checkBot = selectionModel.flatMap((it) => botMap[it]).length > 0;
    if (checkBot) {
      onErrorMsg(
        'The bot cannot be deleted, the knowledge base must be deleted first!'
      );
    } else if (selectionModel && selectionModel.length > 0) {
      deleteStaffByIds({ variables: { ids: selectionModel } });
    }
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('Id'), width: 90 },
    { field: 'username', headerName: t('Username'), width: 150 },
    { field: 'nickName', headerName: t('Nickname'), width: 150 },
    { field: 'realName', headerName: t('Real name'), width: 150 },
    {
      field: 'role',
      headerName: t('Role'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Staff');
        if (params.value === 'ROLE_ADMIN') {
          result = t('Administrator');
        }
        return result;
      },
    },
    {
      field: 'staffType',
      headerName: t('Staff type'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Bot');
        if (params.value === 1) {
          result = t('Manual');
        }
        return result;
      },
    },
    { field: 'groupName', headerName: t('Group name'), width: 150 },
    {
      field: 'gender',
      headerName: t('Gender'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        let result = t('Other');
        switch (params.value) {
          case 0: {
            result = t('Male');
            break;
          }
          case 1: {
            result = t('Female');
            break;
          }
          default: {
            break;
          }
        }
        return result;
      },
    },
    { field: 'mobilePhone', headerName: t('Mobile'), width: 150 },
    {
      field: 'simultaneousService',
      headerName: t('Number of simultaneous services'),
      type: 'number',
      width: 150,
    },
    // {
    //   field: 'maxTicketPerDay',
    //   headerName: '每日上限（工单）',
    //   type: 'number',
    //   width: 150,
    // },
    // {
    //   field: 'maxTicketAllTime',
    //   headerName: '总上限（工单）',
    //   type: 'number',
    //   width: 150,
    // },
    {
      field: 'personalizedSignature',
      headerName: t('Signature'),
      width: 150,
    },
    {
      field: 'enabled',
      headerName: t('Enable?'),
      type: 'boolean',
      width: 150,
    },
  ];

  return (
    <>
      <DraggableDialog title={t('Staff info')} ref={refOfDialog}>
        <StaffForm defaultValues={staff} />
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
          handleClickOpen(param.row as Staff);
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
