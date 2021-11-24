import React, { useRef, useState } from 'react';

import { gql, useMutation, useQuery } from '@apollo/client';

import DateFnsUtils from '@date-io/date-fns';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowId,
} from '@material-ui/data-grid';

import GRID_DEFAULT_LOCALE_TEXT from 'app/variables/gridLocaleText';
import { Chip, Divider } from '@material-ui/core';
import { PageResult } from 'app/domain/Page';
import { Customer, CustomerTagView } from 'app/domain/Customer';
import getPageQuery from 'app/domain/graphql/Page';
import CustomerForm, {
  CustomerFormValues,
} from 'app/components/Chat/DetailCard/panel/CustomerForm';
import { CustomerGridToolbarCreater } from 'app/components/Table/CustomerGridToolbar';
import { SearchHit } from 'app/domain/Conversation';
import SearchForm from 'app/components/SearchForm/SearchForm';
import { PageParam } from 'app/domain/graphql/Query';
import {
  CORE_CUSTOMER_FIELDS,
  CustomerQueryInput,
} from 'app/domain/graphql/Customer';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import useAlert from 'app/hook/alert/useAlert';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'uid', headerName: '用户标识', width: 150 },
  { field: 'name', headerName: '用户姓名', width: 150 },
  {
    field: 'tags',
    headerName: '用户标签',
    width: 300,
    renderCell: function ColorIcon(params: GridCellParams) {
      const { value } = params;
      const customerTagViewList = value as CustomerTagView[] | undefined;
      return (
        <>
          {customerTagViewList &&
            customerTagViewList.map(({ name, color: colorHex }) => (
              <Chip
                key={name}
                size="small"
                color="secondary"
                label={name}
                style={{ backgroundColor: colorHex as string }}
              />
            ))}
        </>
      );
    },
  },
  { field: 'email', headerName: '用户邮箱', width: 150 },
  { field: 'mobile', headerName: '用户手机号', width: 150 },
  { field: 'vipLevel', headerName: 'vip等级', width: 150 },
  { field: 'remarks', headerName: '备注', width: 150 },
];

interface Graphql {
  searchCustomer: PageResult<SearchHit<Customer>>;
}

const CONTENT_QUERY = gql`
  ${CORE_CUSTOMER_FIELDS}
  fragment customerSearchHitContent on CustomerSearchHit {
    content {
      ...customerFields
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
  'customerSearchHitContent'
);

const QUERY = gql`
  ${CUSTOMER_PAGE_QUERY}
  query FindAllCustomer($customerQuery: CustomerQueryInput!) {
    searchCustomer(customerQuery: $customerQuery) {
      ...pageOnCustomerSearchHitPage
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
  timeRange: {
    from: dateFnsUtils.format(
      dateFnsUtils.startOfMonth(new Date()),
      "yyyy-MM-dd'T'HH:mm:ss.SSSXX"
    ),
    to: dateFnsUtils.format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSXX"),
  },
};

export default function Crm() {
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [selectCustomer, setSelectCustomer] = useState<
    CustomerFormValues | undefined
  >(undefined);
  const [customerQueryInput, setCustomerQueryInput] =
    useState<CustomerQueryInput>(defaultValue);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY, {
    variables: { customerQuery: customerQueryInput },
  });
  const { onLoadding, onCompleted, onError } = useAlert();
  const [deleteCustomerByIds, { loading: deleteLoading }] =
    useMutation<unknown>(MUTATION_CUSTOMER, {
      onCompleted,
      onError,
    });
  if (deleteLoading) {
    onLoadding(deleteLoading);
  }

  const handleClickOpen = (user: Customer) => {
    setSelectCustomer(user);
    refOfDialog.current?.setOpen(true);
  };

  function setAndRefetch(searchParams: CustomerQueryInput) {
    setCustomerQueryInput(searchParams);
    refetch({ customerQuery: searchParams });
  }

  const handlePageChange = (params: number) => {
    customerQueryInput.page = new PageParam(
      params,
      customerQueryInput.page.size
    );
    setAndRefetch(customerQueryInput);
  };

  const handlePageSizeChange = (params: number) => {
    customerQueryInput.page = new PageParam(
      customerQueryInput.page.page,
      params
    );
    setAndRefetch(customerQueryInput);
  };
  const result = data?.searchCustomer;
  const rows =
    result && result.content ? result.content.map((it) => it.content) : [];
  const pageSize = result ? result.size : 20;
  const rowCount = result ? result.totalElements : 0;

  function newButtonClick() {
    setSelectCustomer(undefined);
    refOfDialog.current?.setOpen(true);
  }

  async function deleteButtonClick() {
    if (selectionModel && selectionModel.length > 0) {
      await deleteCustomerByIds({ variables: { ids: selectionModel } });
      await refetch();
    }
  }

  const setSearchParams = (searchParams: CustomerQueryInput) => {
    searchParams.page = customerQueryInput.page;
    setCustomerQueryInput(searchParams);
    refetch({ customerQuery: searchParams });
  };

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <DraggableDialog title="详细用户信息" ref={refOfDialog}>
        <CustomerForm defaultValues={selectCustomer} shouldDispatch={false} />
      </DraggableDialog>
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
