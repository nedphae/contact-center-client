import React, { useRef, useState } from 'react';

import _ from 'lodash';
import { gql, useMutation, useQuery } from '@apollo/client';
import { DataGrid, GridColDef, GridRowId } from '@material-ui/data-grid';

import {
  QUERY_GROUP,
  QUERY_STAFF,
  StaffGroupList,
  StaffList,
} from 'app/domain/graphql/Staff';
import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StaffForm from 'app/components/StaffForm/StaffForm';
import Staff from 'app/domain/StaffInfo';

type Graphql = StaffList;

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'username', headerName: '用户名', width: 150 },
  { field: 'nickName', headerName: '昵称', width: 150 },
  { field: 'realName', headerName: '实名', width: 150 },
  { field: 'role', headerName: '角色', width: 150 },
  { field: 'staffType', headerName: '客服类型', width: 150 },
  { field: 'groupName', headerName: '组名', width: 150 },
  { field: 'gender', headerName: '性别', width: 150 },
  { field: 'mobilePhone', headerName: '手机', width: 150 },
  {
    field: 'simultaneousService',
    headerName: '同时服务数',
    type: 'number',
    width: 150,
  },
  {
    field: 'maxTicketPerDay',
    headerName: '每日上限（工单）',
    type: 'number',
    width: 150,
  },
  {
    field: 'maxTicketAllTime',
    headerName: '总上限（工单）',
    type: 'number',
    width: 150,
  },
  { field: 'personalizedSignature', headerName: '个性签名', width: 150 },
  { field: 'enabled', headerName: '是否启用', type: 'boolean', width: 150 },
];

const defaultStaff = { staffType: 1 } as Staff;

const MUTATION_STAFF = gql`
  mutation DeleteStaff($ids: [Long!]!) {
    deleteStaffByIds(ids: $ids)
  }
`;

export default function AccountList() {
  const { loading, data, refetch } = useQuery<Graphql>(QUERY_STAFF);
  const { data: groupList } = useQuery<StaffGroupList>(QUERY_GROUP);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [staff, setStaff] = useState<Staff>(defaultStaff);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [deleteStaffByIds] = useMutation<unknown>(MUTATION_STAFF);

  const groupMap = _.groupBy(groupList?.allStaffGroup ?? [], (it) => it.id);
  const rows = [...(data?.allStaff ?? [])].map((it) => {
    it.groupName = groupMap[it.groupId][0].groupName;
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
    if (selectionModel && selectionModel.length > 0) {
      deleteStaffByIds({ variables: { ids: selectionModel } });
    }
  }

  return (
    <>
      <DraggableDialog title="客服信息" ref={refOfDialog}>
        <StaffForm defaultValues={staff} />
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
