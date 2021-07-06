import React, { useRef, useState } from 'react';

import { gql, useQuery } from '@apollo/client';
import { DataGrid, GridColDef } from '@material-ui/data-grid';

import { StaffList } from 'app/domain/graphql/Staff';
import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StaffForm from 'app/components/StaffForm/StaffForm';
import Staff from 'app/domain/StaffInfo';

const STAFF_QUERY = gql`
  query Staff {
    allStaff {
      avatar
      enabled
      gender
      id
      maxTicketAllTime
      maxTicketPerDay
      mobilePhone
      nickName
      organizationId
      password
      personalizedSignature
      realName
      role
      simultaneousService
      staffGroupId
      staffType
      username
    }
  }
`;

type Graphql = StaffList;

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'username', headerName: '用户名', width: 150 },
  { field: 'nickName', headerName: '昵称', width: 150 },
  { field: 'realName', headerName: '实名', width: 150 },
  { field: 'role', headerName: '角色', width: 150 },
  { field: 'staffType', headerName: '客服类型', width: 150 },
  { field: 'staffGroupId', headerName: '组名', width: 150 },
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

export default function AccountList() {
  const { loading, data } = useQuery<Graphql>(STAFF_QUERY);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [staff, setStaff] = useState<Staff>(defaultStaff);
  const rows = data?.allStaff ?? [];

  function newButtonClick() {
    setStaff(defaultStaff);
    refOfDialog.current?.setOpen(true);
  }

  const handleClickOpen = (selectStaff: Staff) => {
    setStaff(selectStaff);
    refOfDialog.current?.setOpen(true);
  };

  return (
    <>
      <DraggableDialog title="详细聊天消息" ref={refOfDialog}>
        <StaffForm defaultValues={staff} />
      </DraggableDialog>
      <DataGrid
        localeText={GRID_DEFAULT_LOCALE_TEXT}
        rows={rows}
        columns={columns}
        components={{
          // TODO: 自定义分组
          Toolbar: CustomerGridToolbarCreater({ newButtonClick }),
        }}
        onRowClick={(param) => {
          handleClickOpen(param.row as Staff);
        }}
        pagination
        pageSize={20}
        loading={loading}
        disableSelectionOnClick
      />
    </>
  );
}
