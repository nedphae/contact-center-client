import React, { useRef, useState } from 'react';

import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { gql, useQuery } from '@apollo/client';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { TreeView } from '@material-ui/lab';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import SubjectIcon from '@material-ui/icons/Subject';
import { DataGrid, GridColDef } from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { AllShunt } from 'app/domain/graphql/Staff';
import StyledTreeItem from 'app/components/TreeView/StyledTreeItem';
import { ShuntClass, StaffShunt } from 'app/domain/StaffInfo';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import StaffShuntForm from 'app/components/StaffForm/StaffShuntForm';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';

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

const SHUNT_QUERY = gql`
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

type Graphql = AllShunt;

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: '接待组名称', width: 150 },
  { field: 'shuntClassId', headerName: '接待组所属分类', width: 150 },
  { field: 'code', headerName: '接待组代码', width: 250 },
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
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const { loading, data } = useQuery<Graphql>(SHUNT_QUERY);

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
    (it) => it.catalogue ?? -2
  );
  const pShuntClass = data?.allShuntClass
    .map((it) => {
      it.children = allShuntClass[it.id];
      return it;
    })
    .filter((it) => it.catalogue === undefined || it.catalogue === null);

  return (
    <Grid container className={classes.root}>
      <DraggableDialog title="添加/修改接待组" ref={refOfDialog}>
        <StaffShuntForm defaultValues={staffShunt} />
      </DraggableDialog>
      <Grid item xs={12} sm={2}>
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
            Toolbar: CustomerGridToolbarCreater({ newButtonClick }),
          }}
          onRowClick={(param) => {
            handleClickOpen(param.row as StaffShunt);
          }}
          pagination
          pageSize={20}
          loading={loading}
          disableSelectionOnClick
        />
      </Grid>
    </Grid>
  );
}
