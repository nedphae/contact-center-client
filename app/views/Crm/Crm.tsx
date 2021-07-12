import React, { useState } from 'react';

import { gql, useQuery } from '@apollo/client';

import {
  DataGrid,
  GridColDef,
  GridPageChangeParams,
} from '@material-ui/data-grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Draggable from 'react-draggable';
import Paper, { PaperProps } from '@material-ui/core/Paper';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { Divider } from '@material-ui/core';
import { PageContent } from 'app/domain/Page';
import { Customer } from 'app/domain/Customer';
import getPageQuery from 'app/domain/graphql/Page';
import CustomerForm, {
  CustomerFormValues,
} from 'app/components/Chat/DetailCard/panel/CustomerForm';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'uid', headerName: '用户标识', width: 150 },
  { field: 'name', headerName: '用户姓名', width: 150 },
  { field: 'email', headerName: '用户邮箱', width: 150 },
  { field: 'mobile', headerName: '用户手机号', width: 150 },
  { field: 'vipLevel', headerName: 'vip等级', width: 150 },
  { field: 'remarks', headerName: '备注', width: 150 },
];

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Paper {...props} />
    </Draggable>
  );
}

interface Graphql {
  findAllCustomer: PageContent<Customer>;
}

const CONTENT_QUERY = gql`
  fragment CustomerContent on Customer {
    organizationId
    id
    uid
    name
    email
    mobile
    vipLevel
    remarks
    detailData: data {
      id
      key
      label
      value
      index
      hidden
      href
    }
  }
`;

const PAGE_QUERY = getPageQuery(
  'CustomerPage',
  CONTENT_QUERY,
  'CustomerContent'
);

const QUERY = gql`
  ${PAGE_QUERY}
  query FindAllCustomer($first: Int!, $offset: Int!) {
    findAllCustomer(first: $first, offset: $offset) {
      ...PageCustomerPage
    }
  }
`;

export default function Crm() {
  const [open, setOpen] = useState(false);
  const [selectCustomer, setSelectCustomer] = useState<
    CustomerFormValues | undefined
  >(undefined);

  const { loading, data, fetchMore } = useQuery<Graphql>(QUERY, {
    variables: { first: 20, offset: 0 },
  });

  const handleClickOpen = (user: Customer) => {
    const idUser = {
      id: user.id,
      organizationId: user.organizationId,
      uid: user.uid,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      vipLevel: user.vipLevel,
      remarks: user.remarks,
      detailData: user.detailData,
    };
    setSelectCustomer(idUser);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePageChange = (params: GridPageChangeParams) => {
    fetchMore({ variables: { first: params.pageSize, offset: params.page } });
  };
  const result = data ? data.findAllCustomer : null;
  const rows = result && result.content ? result.content : [];
  const pageSize = result ? result.size : 0;
  const rowCount = result ? result.totalElements : 0;

  function newButtonClick() {
    setSelectCustomer(undefined);
    setOpen(true);
  }

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <Dialog
        disableEnforceFocus
        disableBackdropClick
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          详细用户信息
        </DialogTitle>
        <DialogContent>
          <CustomerForm defaultValues={selectCustomer} shouldDispatch={false} />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            取消
          </Button>
        </DialogActions>
      </Dialog>
      <Divider variant="inset" component="li" />
      <DataGrid
        localeText={GRID_DEFAULT_LOCALE_TEXT}
        rows={rows}
        columns={columns}
        components={{
          Toolbar: CustomerGridToolbarCreater({ newButtonClick }),
        }}
        pagination
        pageSize={pageSize}
        // 全部的列表
        rowCount={rowCount}
        rowsPerPageOptions={[10, 20, 50, 100]}
        paginationMode="server"
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageChange}
        loading={loading}
        disableSelectionOnClick
        onRowClick={(param) => {
          handleClickOpen(param.row as Customer);
        }}
      />
    </div>
  );
}
