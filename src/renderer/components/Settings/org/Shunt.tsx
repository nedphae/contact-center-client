import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import _ from 'lodash';
import { gql, useMutation, useQuery } from '@apollo/client';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Grid, Menu, MenuItem } from '@material-ui/core';
import { TreeView } from '@material-ui/lab';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValueGetterParams,
} from '@material-ui/data-grid';

import config from 'renderer/config/clientConfig';
import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
import {
  AllShunt,
  QUERY_STAFF,
  AllStaffList,
} from 'renderer/domain/graphql/Staff';
import StyledTreeItem, {
  CloseSquare,
  MinusSquare,
  PlusSquare,
} from 'renderer/components/TreeView/StyledTreeItem';
import { ShuntClass, StaffShunt } from 'renderer/domain/StaffInfo';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import StaffShuntForm from 'renderer/components/StaffForm/StaffShuntForm';
import { CustomerGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import TreeToolbar from 'renderer/components/Header/TreeToolbar';
import ShuntClassForm from 'renderer/components/StaffForm/ShuntClassForm';
import { MousePoint, initialMousePoint } from 'renderer/domain/Client';
import useAlert from 'renderer/hook/alert/useAlert';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 'calc(100vh - 70px)',
      flexGrow: 1,
    },
    list: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  })
);

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
    allShuntClass {
      id
      className
      catalogue
    }
  }
`;

const MUTATION_DELETE_SHUNT = gql`
  mutation DeleteShunt($ids: [Long!]!) {
    deleteShuntByIds(ids: $ids)
  }
`;

const MUTATION_DELETE_SHUNT_CLASS = gql`
  mutation DeleteShuntClass($ids: [Long!]!) {
    deleteShuntClassByIds(ids: $ids)
  }
`;

type Graphql = AllShunt;

export default function Shunt() {
  const classes = useStyles();
  const { t, i18n } = useTranslation();

  const columns: GridColDef[] = [
    // { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: t('Shunt Name'), width: 250 },
    {
      field: 'shuntClassName',
      headerName: t('Shunt Classification'),
      width: 250,
    },
    { field: 'code', headerName: t('Shunt Code'), width: 350 },
    {
      field: 'webUrl',
      headerName: t('Shunt Web URL'),
      width: 350,
      valueGetter: (params: GridValueGetterParams) => {
        const { code } = params.row;
        return `${config.web.host}/chat/?sc=${code}`;
      },
    },
  ];

  const [mousePoint, setMousePoint] = useState<MousePoint>(initialMousePoint);

  const [staffShunt, setStaffShunt] = useState<StaffShunt>();
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [staffShuntClass, setStaffShuntClass] = useState<ShuntClass>();
  const refOfClassDialog = useRef<DraggableDialogRef>(null);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY_SHUNT);
  const { data: staffList } = useQuery<AllStaffList>(QUERY_STAFF);

  const { onLoadding, onCompleted, onError } = useAlert();
  const [deleteByIds, { loading: deleteLoading }] = useMutation<number>(
    MUTATION_DELETE_SHUNT,
    {
      onCompleted,
      onError,
    }
  );
  if (deleteLoading) {
    onLoadding('Deleting');
  }

  const [deleteClasByIds, { loading: deleteClassLoading }] =
    useMutation<number>(MUTATION_DELETE_SHUNT_CLASS, {
      onCompleted,
      onError,
    });
  if (deleteClassLoading) {
    onLoadding('Deleting');
  }

  function newButtonClick() {
    setStaffShunt(undefined);
    refOfDialog.current?.setOpen(true);
  }

  const handleClickOpen = (selectShunt: StaffShunt) => {
    setStaffShunt(selectShunt);
    refOfDialog.current?.setOpen(true);
  };

  const handleContextMenuOpen = (
    event: React.MouseEvent<HTMLLIElement>,
    selectStaffShuntClass: ShuntClass
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMousePoint({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
    setStaffShuntClass(selectStaffShuntClass);
  };

  async function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      await deleteByIds({ variables: { ids: selectionModel } });
      refetch();
    }
  }

  const handleContextMenuClose = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMousePoint(initialMousePoint);
  };

  const buildTreeView = useCallback((shuntClassList: ShuntClass[]) => {
    return shuntClassList.map((it) => (
      <StyledTreeItem
        key={it.id?.toString()}
        nodeId={it.catalogue === -1 ? 'root' : `shuntClass-${it.id}`}
        label={it.className}
        onContextMenu={(event) => handleContextMenuOpen(event, it)}
      >
        {it.children && buildTreeView(it.children)}
      </StyledTreeItem>
    ));
  }, []);

  const [memoTreeView, rows] = useMemo(() => {
    const allShuntClass = _.cloneDeep(data?.allShuntClass ?? []);
    const allShuntClassMap = _.groupBy(
      _.cloneDeep(data?.allShuntClass),
      (it) => it.catalogue
    );
    const allShuntClassIdMap = _.groupBy(
      _.cloneDeep(data?.allShuntClass),
      (it) => it.id
    );
    const pShuntClass = allShuntClass
      .map((it) => {
        it.children = allShuntClassMap[it.id];
        return it;
      })
      .filter((it) => it.catalogue === -1);
    const tempRows = (data?.allStaffShunt ?? []).map((item) =>
      _.defaults(
        { shuntClassName: allShuntClassIdMap[item.shuntClassId][0].className },
        item
      )
    );
    return [buildTreeView(pShuntClass), tempRows];
  }, [buildTreeView, data]);

  return (
    <Grid container className={classes.root}>
      {/* 右键菜单 */}
      <div
        onContextMenu={handleContextMenuClose}
        style={{ cursor: 'context-menu' }}
      >
        <Menu
          keepMounted
          open={mousePoint.mouseY !== undefined}
          onClose={handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            mousePoint.mouseY !== undefined && mousePoint.mouseX !== undefined
              ? { top: mousePoint.mouseY, left: mousePoint.mouseX }
              : undefined
          }
        >
          <MenuItem
            onClick={() => {
              refOfClassDialog.current?.setOpen(true);
              setMousePoint(initialMousePoint);
            }}
          >
            {t('Modify Shunt Classification')}
          </MenuItem>
          {staffShuntClass && staffShuntClass.catalogue !== -1 && (
            <MenuItem
              onClick={async () => {
                if (staffShuntClass) {
                  await deleteClasByIds({
                    variables: { ids: [staffShuntClass.id] },
                  });
                  refetch();
                }
                setMousePoint(initialMousePoint);
              }}
            >
              {t('Delete Shunt Classification')}
            </MenuItem>
          )}
        </Menu>
      </div>
      <DraggableDialog
        title={t('Add/Modify Shunt')}
        ref={refOfDialog}
        fullWidth
        maxWidth="md"
      >
        <StaffShuntForm
          defaultValues={staffShunt}
          shuntClassList={data?.allShuntClass ?? []}
          staffList={staffList?.allStaff ?? []}
        />
      </DraggableDialog>
      <Grid item xs={12} sm={2}>
        <DraggableDialog
          title={t('Add/Modify Shunt Classification')}
          ref={refOfClassDialog}
        >
          <ShuntClassForm defaultValues={staffShuntClass} />
        </DraggableDialog>
        <TreeToolbar
          title={t('Shunt Classification')}
          refetch={refetch}
          adderName={t('Add Shunt Classification')}
          add={() => {
            setStaffShuntClass(undefined);
            refOfClassDialog.current?.setOpen(true);
          }}
        />
        <TreeView
          className={classes.list}
          defaultExpanded={['root']}
          defaultSelected={['root']}
          defaultCollapseIcon={<MinusSquare />}
          defaultExpandIcon={<PlusSquare />}
          defaultEndIcon={<CloseSquare />}
        >
          {memoTreeView}
        </TreeView>
      </Grid>
      <Grid item xs={12} sm={10}>
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
            handleClickOpen(param.row as StaffShunt);
          }}
          pagination
          paginationMode="client"
          pageSize={20}
          rowsPerPageOptions={[20]}
          loading={loading}
          disableSelectionOnClick
          checkboxSelection
          onSelectionModelChange={(selectionId: GridRowId[]) => {
            setSelectionModel(selectionId);
          }}
          selectionModel={selectionModel}
        />
      </Grid>
    </Grid>
  );
}
