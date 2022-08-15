import { useMemo, useRef, useState } from 'react';
import _ from 'lodash';

import { gql, useMutation, useQuery } from '@apollo/client';

import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowId,
} from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'renderer/variables/gridLocaleText';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import { CustomerGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import useAlert from 'renderer/hook/alert/useAlert';
import {
  MUTATION_WECHAT_INFO,
  QUERY_WECHAT_INFO,
  UpdateWeChatOpenInfoGraphql,
  WeChatOpenInfo,
  WeChatOpenInfoGraphql,
} from 'renderer/domain/WeChatOpenInfo';
import { StaffShuntList } from 'renderer/domain/graphql/Staff';
import { Button, ButtonGroup } from '@material-ui/core';
import clientConfig from 'renderer/config/clientConfig';
import WeChatOpenInfoForm from './form/WeChatOpenInfoForm';

type Graphql = WeChatOpenInfoGraphql;

const QUERY_SHUNT = gql`
  query Shunt {
    allStaffShunt {
      code
      id
      name
      organizationId
      shuntClassId
      openPush
      authorizationToken
    }
  }
`;

export default function WeChatOpenInfoView() {
  const [weChatOpenInfo, setWeChatOpenInfo] = useState<WeChatOpenInfo>();
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY_WECHAT_INFO);
  const { data: staffShunt } = useQuery<StaffShuntList>(QUERY_SHUNT);

  const { onLoadding, onCompleted, onError } = useAlert();
  const [updateWeChatOpenInfo, { loading: updateLoading }] =
    useMutation<UpdateWeChatOpenInfoGraphql>(MUTATION_WECHAT_INFO, {
      onCompleted,
      onError,
    });
  if (updateLoading) {
    onLoadding(updateLoading);
  }

  const handleClickOpen = (selectWeChatOpenInfo: WeChatOpenInfo) => {
    setWeChatOpenInfo(selectWeChatOpenInfo);
    refOfDialog.current?.setOpen(true);
  };

  const shuntList = staffShunt?.allStaffShunt ?? [];
  const shuntMap = _.groupBy(shuntList, 'id');
  const rows = data?.getAllWeChatOpenInfo ?? [];
  rows.forEach((it) => {
    if (it.shuntId) {
      const [shunt] = shuntMap[it.shuntId];
      it.shuntName = shunt.name;
    }
  });

  const columns: GridColDef[] = useMemo(() => {
    async function toggleWeChatOpenInfo(
      value: WeChatOpenInfo,
      isEnable = true
    ) {
      if (isEnable) {
        value.enable = !value.enable;
      } else {
        value.remove = !value.remove;
      }
      await updateWeChatOpenInfo({ variables: value });
      refetch();
    }

    return [
      // { field: 'id', headerName: 'ID', width: 90 },
      { field: 'nickName', headerName: '微信公众号', width: 250 },
      { field: 'enable', headerName: '状态', width: 250 },
      { field: 'bindingTime', headerName: '绑定时间', width: 250 },
      {
        field: 'operation',
        headerName: '操作',
        width: 250,
        renderCell: function ColorIcon(params: GridCellParams) {
          const { value } = params;
          const cellWeChatOpenInfo = value as WeChatOpenInfo;
          return (
            <>
              <Button
                size="medium"
                onClick={() => {
                  toggleWeChatOpenInfo(cellWeChatOpenInfo);
                }}
              >
                {cellWeChatOpenInfo.enable ? '停用' : '启用'}
              </Button>
              <Button
                size="medium"
                onClick={() => {
                  toggleWeChatOpenInfo(cellWeChatOpenInfo, false);
                }}
              >
                解绑
              </Button>
            </>
          );
        },
      },
    ];
  }, [refetch, updateWeChatOpenInfo]);

  return (
    <>
      <DraggableDialog title="关联接待组" ref={refOfDialog}>
        <WeChatOpenInfoForm
          defaultValues={weChatOpenInfo}
          refetch={refetch}
          shuntList={shuntList}
        />
      </DraggableDialog>
      <ButtonGroup color="primary" aria-label="wechat add">
        <Button
          onClick={() => {
            window.open(
              `${clientConfig.web.host}/wechat/api/auth/goto_auth_url`,
              '_blank',
              'electron:true'
            );
          }}
        >
          绑定公众号
        </Button>
        {/* <Button>绑定小程序</Button> */}
      </ButtonGroup>
      <DataGrid
        localeText={GRID_DEFAULT_LOCALE_TEXT}
        rows={rows}
        columns={columns}
        components={{
          Toolbar: CustomerGridToolbarCreater({
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
