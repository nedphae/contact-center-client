import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { gql, useMutation, useQuery } from '@apollo/client';

import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowId,
  GridValueGetterParams,
} from '@material-ui/data-grid';

import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
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
import { getMyself } from 'renderer/state/staff/staffAction';
import { useAppSelector } from 'renderer/store';
import javaInstant2DateStr from 'renderer/utils/timeUtils';
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
  const mySelf = useAppSelector(getMyself);
  const { t, i18n } = useTranslation();

  const [weChatOpenInfo, setWeChatOpenInfo] = useState<WeChatOpenInfo>();
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY_WECHAT_INFO);

  const { onLoadding, onCompleted, onError } = useAlert();

  const { data: staffShunt } = useQuery<StaffShuntList>(QUERY_SHUNT, {
    onError,
  });

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
  let rows = data?.getAllWeChatOpenInfo ?? [];
  rows = rows.map((it) => {
    if (it.shuntId) {
      const [shunt] = shuntMap[it.shuntId];
      return _.assign({ shuntName: shunt.name }, it);
    }
    return it;
  });

  const columns: GridColDef[] = useMemo(() => {
    async function toggleWeChatOpenInfo(
      value: WeChatOpenInfo,
      isEnable = true
    ) {
      const tempWeChatOpenInfo = _.omit(value, '__typename', 'shuntName');
      if (isEnable) {
        tempWeChatOpenInfo.enable = !tempWeChatOpenInfo.enable;
      } else {
        tempWeChatOpenInfo.remove = !tempWeChatOpenInfo.remove;
      }
      await updateWeChatOpenInfo({
        variables: { weChatOpenInfo: tempWeChatOpenInfo },
      });
      refetch();
    }

    return [
      // { field: 'id', headerName: 'ID', width: 90 },
      {
        field: 'nickname',
        headerName: t('WeChat Official Accounts'),
        width: 250,
      },
      {
        field: 'enable',
        headerName: t('State'),
        width: 250,
        valueGetter: (params: GridValueGetterParams) => {
          const enable = params.value;
          return enable ? t('Enabled') : t('Disabled');
        },
      },
      {
        field: 'bindingTime',
        headerName: t('Binding time'),
        width: 250,
        valueGetter: (params: GridValueGetterParams) => {
          return params.value
            ? javaInstant2DateStr(params.value as number)
            : null;
        },
      },
      {
        field: 'operation',
        headerName: t('Operate'),
        width: 250,
        renderCell: function ColorIcon(params: GridCellParams) {
          const { row } = params;
          const cellWeChatOpenInfo = row as WeChatOpenInfo;
          return (
            <ButtonGroup color="primary" aria-label="wechat add">
              <Button
                size="medium"
                onClick={(event) => {
                  handleClickOpen(cellWeChatOpenInfo);
                  event.preventDefault();
                  return false;
                }}
              >
                {t('Associate to shunt')}
              </Button>
              <Button
                size="medium"
                onClick={(event) => {
                  toggleWeChatOpenInfo(cellWeChatOpenInfo);
                  event.preventDefault();
                  return false;
                }}
              >
                {cellWeChatOpenInfo.enable ? t('Disable') : t('Enable')}
              </Button>
              <Button
                size="medium"
                onClick={(event) => {
                  toggleWeChatOpenInfo(cellWeChatOpenInfo, false);
                  event.preventDefault();
                  return false;
                }}
              >
                {t('Unbind')}
              </Button>
            </ButtonGroup>
          );
        },
      },
    ];
  }, [refetch, t, updateWeChatOpenInfo]);

  return (
    <div style={{ height: 'calc(100vh - 106.5px)' }}>
      <DraggableDialog title={t('Associate to shunt')} ref={refOfDialog}>
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
              `${clientConfig.web.host}/wechat/api/auth/auth_url_page?org_id=${mySelf.organizationId}`,
              '_blank',
              'electron:true'
            );
          }}
        >
          {t('Bind the WeChat Official Accounts')}
        </Button>
        {/* <Button>绑定小程序</Button> */}
      </ButtonGroup>
      <DataGrid
        localeText={gridLocaleTextMap.get(i18n.language)}
        rows={rows}
        columns={columns}
        components={{
          Toolbar: CustomerGridToolbarCreater({
            refetch: () => {
              refetch();
            },
          }),
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
    </div>
  );
}
