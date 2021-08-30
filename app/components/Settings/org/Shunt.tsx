import React, { useRef, useState } from 'react';

import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { gql, useMutation, useQuery } from '@apollo/client';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { TreeView } from '@material-ui/lab';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import SubjectIcon from '@material-ui/icons/Subject';
import { DataGrid, GridColDef, GridRowId } from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { AllShunt, QUERY_STAFF, StaffList } from 'app/domain/graphql/Staff';
import StyledTreeItem from 'app/components/TreeView/StyledTreeItem';
import { ShuntClass, StaffShunt } from 'app/domain/StaffInfo';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StaffShuntForm from 'app/components/StaffForm/StaffShuntForm';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import TreeToolbar from 'app/components/Header/TreeToolbar';

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
  { field: 'shuntClassId', headerName: '接待组所属分类', width: 250 },
  { field: 'code', headerName: '接待组代码', width: 350 },
];

function buildTreeView(shuntClassList: ShuntClass[]) {
  return shuntClassList.map((it) => (
    <StyledTreeItem
      key={it.id?.toString()}
      nodeId={uuidv4()}
      labelText={it.className}
      labelIcon={SubjectIcon}
    >
      {it.children && buildTreeView(it.children)}
    </StyledTreeItem>
  ));
}

export default function Shunt() {
  const classes = useStyles();
  const [staffShunt, setStaffShunt] = useState<StaffShunt | undefined>(
    undefined
  );
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY_SHUNT);
  const { data: staffList } = useQuery<StaffList>(QUERY_STAFF);
  const [deleteByIds] = useMutation<number>(MUTATION_SHUNT);

  function newButtonClick() {
    setStaffShunt(undefined);
    refOfDialog.current?.setOpen(true);
  }

  const handleClickOpen = (selectShunt: StaffShunt) => {
    setStaffShunt(selectShunt);
    refOfDialog.current?.setOpen(true);
  };

  const rows = data?.allStaffShunt ?? [];
  const allShuntClass = _.groupBy(
    data?.allShuntClass,
    (it) => it.catalogue ?? -1
  );
  const pShuntClass = data?.allShuntClass
    .map((it) => {
      return _.assign(it, { children: allShuntClass[it.id] });
    })
    .filter((it) => it.catalogue === -1);

  function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      deleteByIds({ variables: { ids: selectionModel } });
    }
  }

  return (
    <Grid container className={classes.root}>
      <DraggableDialog title="添加/修改接待组" ref={refOfDialog}>
        <StaffShuntForm
          defaultValues={staffShunt}
          shuntClassList={data?.allShuntClass ?? []}
          staffList={staffList?.allStaff ?? []}
        />
      </DraggableDialog>
      <Grid item xs={12} sm={2}>
        <TreeToolbar
          refetch={refetch}
          adderName="添加接待组分类"
          add={() => {}}
        />
        <TreeView
          className={classes.list}
          defaultCollapseIcon={<ArrowDropDownIcon />}
          defaultExpandIcon={<ArrowRightIcon />}
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
