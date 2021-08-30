import React, { useState } from 'react';

import { gql, useMutation, useQuery } from '@apollo/client';

import DateFnsUtils from '@date-io/date-fns';
import { DataGrid, GridColDef, GridRowId } from '@material-ui/data-grid';
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
import { SearchHit } from 'app/domain/Conversation';
import SearchForm from 'app/components/SearchForm/SearchForm';
import { PageParam } from 'app/domain/graphql/Query';
import { CustomerQueryInput } from 'app/domain/graphql/Customer';

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
  searchCustomer: PageContent<SearchHit<Customer>>;
}

const CONTENT_QUERY = gql`
  fragment CustomerSearchHitContent on CustomerSearchHit {
    content {
      organizationId
      id
      uid
      name
      email
      mobile
      vipLevel
      remarks
      data {
        key
        label
        value
        index
        hidden
        href
      }
    }
    highlightFields
    id
    index
    innerHits
    nestedMetaData
    score
    sortValues
  }
`;

const CUSTOMER_PAGE_QUERY = getPageQuery(
  'CustomerSearchHitPage',
  CONTENT_QUERY,
  'CustomerSearchHitContent'
);

const QUERY = gql`
  ${CUSTOMER_PAGE_QUERY}
  query FindAllCustomer($customerQuery: CustomerQueryInput!) {
    searchCustomer(customerQuery: $customerQuery) {
      ...PageOnCustomerSearchHitPage
    }
  }
`;
const MUTATION_CUSTOMER = gql`
  mutation DeleteCustomer($ids: [Long!]!) {
    deleteCustomerByIds(ids: $ids)
  }
`;
const dateFnsUtils = new DateFnsUtils();

const defaultValue = {
  page: new PageParam(),
  timeRange: { from: dateFnsUtils.startOfMonth(new Date()), to: new Date() },
};

export default function Crm() {
  const [open, setOpen] = useState(false);
  const [selectCustomer, setSelectCustomer] = useState<
    CustomerFormValues | undefined
  >(undefined);
  const [customerQueryInput, setCustomerQueryInput] =
    useState<CustomerQueryInput>(defaultValue);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [pageParams, setPageParams] = useState({
    first: 20,
    offset: 0,
  });
  const { loading, data, refetch } = useQuery<Graphql>(QUERY, {
    variables: { customerQuery: customerQueryInput },
  });
  const [deleteCustomerByIds] = useMutation<unknown>(MUTATION_CUSTOMER);

  const handleClickOpen = (user: Customer) => {
    const idUser = {
      id: user.id,
      organizationId: user.organizationId,
      uid: user.uid,
      name: user.name,
      mobile: user.mobile,
      address: user.address,
      email: user.email,
      vipLevel: user.vipLevel,
      remarks: user.remarks,
      data: user.data,
    };
    setSelectCustomer(idUser);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleDialogClose = (
    _: unknown,
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (reason !== 'backdropClick') {
      handleClose();
    }
  };

  const handlePageChange = (params: number) => {
    const newPageParams = { first: pageParams.first, offset: params };
    setPageParams(newPageParams);
  };
  const handlePageSizeChange = (params: number) => {
    const newPageParams = { first: params, offset: pageParams.offset };
    setPageParams(newPageParams);
  };
  const result = data?.searchCustomer;
  const rows =
    result && result.content ? result.content.map((it) => it.content) : [];
  const pageSize = result ? result.size : 20;
  const rowCount = result ? result.totalElements : 0;

  function newButtonClick() {
    setSelectCustomer(undefined);
    setOpen(true);
  }

  function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      deleteCustomerByIds({ variables: { ids: selectionModel } });
    }
  }

  const setSearchParams = (searchParams: CustomerQueryInput) => {
    searchParams.page = customerQueryInput.page;
    setCustomerQueryInput(searchParams);
    refetch({ customerQuery: searchParams });
  };

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <Dialog
        disableEnforceFocus
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleDialogClose}
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
      <SearchForm
        defaultValues={defaultValue}
        currentValues={customerQueryInput}
        searchAction={setSearchParams}
        selectKeyValueList={[]}
      />
      <Divider variant="inset" component="li" />
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
        pagination
        pageSize={pageSize}
        // 全部的列表
        rowCount={rowCount}
        rowsPerPageOptions={[10, 20, 50, 100]}
        paginationMode="server"
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        onRowClick={(param) => {
          handleClickOpen(param.row as Customer);
        }}
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
