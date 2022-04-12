import React, { useRef, useState } from 'react';

import _ from 'lodash';
import { gql, useMutation, useQuery } from '@apollo/client';
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
  MUTATION_STAFF,
} from 'app/domain/graphql/Staff';
import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StaffForm from 'app/components/StaffForm/StaffForm';
import Staff from 'app/domain/StaffInfo';
import useAlert from 'app/hook/alert/useAlert';

type Graphql = AllStaffList;

export const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'username', headerName: '用户名', width: 150 },
  { field: 'nickName', headerName: '昵称', width: 150 },
  { field: 'realName', headerName: '实名', width: 150 },
  { field: 'role', headerName: '角色', width: 150 },
  {
    field: 'staffType',
    headerName: '客服类型',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '机器人';
      if (params.value === 1) {
        result = '人工';
      }
      return result;
    },
  },
  { field: 'groupName', headerName: '组名', width: 150 },
  {
    field: 'gender',
    headerName: '性别',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '其他';
      switch (params.value) {
        case 0: {
          result = '男';
          break;
        }
        case 1: {
          result = '女';
          break;
        }
        default: {
          break;
        }
      }
      return result;
    },
  },
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
  const { loading, data, refetch } = useQuery<Graphql>(QUERY_STAFF);
  const { data: groupList } = useQuery<StaffGroupList>(QUERY_GROUP);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [staff, setStaff] = useState<Staff>(defaultStaff);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  const { onLoadding, onCompleted, onError, onErrorMsg } = useAlert();
  const [deleteStaffByIds, { loading: updateLoading }] = useMutation<unknown>(
    MUTATION_STAFF,
    {
      onCompleted,
      onError,
    }
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
        it
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
      (it) => it.id
    );
    const checkBot = selectionModel.flatMap((it) => botMap[it]).length > 0;
    if (checkBot) {
      onErrorMsg('不能删除机器人，必须先删除知识库！');
    } else if (selectionModel && selectionModel.length > 0) {
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
