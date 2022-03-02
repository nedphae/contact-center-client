import React, { useRef, useState } from 'react';

import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { gql, useMutation, useQuery } from '@apollo/client';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Grid, Menu, MenuItem } from '@material-ui/core';
import { TreeView } from '@material-ui/lab';
import { DataGrid, GridColDef, GridRowId } from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { AllShunt, QUERY_STAFF, StaffList } from 'app/domain/graphql/Staff';
import StyledTreeItem, {
  CloseSquare,
  MinusSquare,
  PlusSquare,
} from 'app/components/TreeView/StyledTreeItem';
import { ShuntClass, StaffShunt } from 'app/domain/StaffInfo';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StaffShuntForm from 'app/components/StaffForm/StaffShuntForm';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import TreeToolbar from 'app/components/Header/TreeToolbar';
import ShuntClassForm from 'app/components/StaffForm/ShuntClassForm';
import { MousePoint, initialMousePoint } from 'app/domain/Client';
import useAlert from 'app/hook/alert/useAlert';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    list: {
      width: '100%',
      height: '80vh',
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

const MUTATION_SHUNT = gql`
  mutation DeleteShunt($ids: [Long!]!) {
    deleteShuntByIds(ids: $ids)
  }
`;

type Graphql = AllShunt;

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: '接待组名称', width: 150 },
  { field: 'shuntClassName', headerName: '接待组所属分类', width: 250 },
  { field: 'code', headerName: '接待组代码', width: 350 },
  { field: 'openPush', headerName: '消息推送地址', width: 350 },
];

export default function Shunt() {
  const classes = useStyles();
  const [mousePoint, setMousePoint] = useState<MousePoint>(initialMousePoint);

  const [staffShunt, setStaffShunt] = useState<StaffShunt>();
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [staffShuntClass, setStaffShuntClass] = useState<ShuntClass>();
  const refOfClassDialog = useRef<DraggableDialogRef>(null);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY_SHUNT);
  const { data: staffList } = useQuery<StaffList>(QUERY_STAFF);

  const { onLoadding, onCompleted, onError } = useAlert();
  const [deleteByIds, { loading: deleteLoading }] = useMutation<number>(
    MUTATION_SHUNT,
    {
      onCompleted,
      onError,
    }
  );
  if (deleteLoading) {
    onLoadding(deleteLoading);
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

  function buildTreeView(shuntClassList: ShuntClass[]) {
    return shuntClassList.map((it) => (
      <StyledTreeItem
        key={it.id?.toString()}
        nodeId={uuidv4()}
        label={it.className}
        onContextMenu={(event) => handleContextMenuOpen(event, it)}
      >
        {it.children && buildTreeView(it.children)}
      </StyledTreeItem>
    ));
  }

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
    .filter((it) => it.catalogue);

  function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      deleteByIds({ variables: { ids: selectionModel } });
    }
  }

  const handleContextMenuClose = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMousePoint(initialMousePoint);
  };

  const rows = (data?.allStaffShunt ?? []).map((item) =>
    _.defaults({ shuntClassName: allShuntClassIdMap[item.shuntClassId] }, item)
  );

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
            修改接待组分类
          </MenuItem>
          <MenuItem onClick={() => {}}>删除接待组分类</MenuItem>
        </Menu>
      </div>
      <DraggableDialog
        title="添加/修改接待组"
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
        <DraggableDialog title="添加/修改接待组分类" ref={refOfClassDialog}>
          <ShuntClassForm defaultValues={staffShuntClass} />
        </DraggableDialog>
        <TreeToolbar
          title="接待组分类"
          refetch={refetch}
          adderName="添加接待组分类"
          add={() => {
            setStaffShuntClass(undefined);
            refOfClassDialog.current?.setOpen(true);
          }}
          clearTopicCategorySelect={() => {}}
        />
        <TreeView
          className={classes.list}
          defaultCollapseIcon={<MinusSquare />}
          defaultExpandIcon={<PlusSquare />}
          defaultEndIcon={<CloseSquare />}
        >
          {pShuntClass && buildTreeView(pShuntClass)}
        </TreeView>
      </Grid>
      <Grid item xs={12} sm={10}>
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
