import { useRef, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { gql, useMutation, useQuery } from '@apollo/client';

import DateFnsUtils from '@date-io/date-fns';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowId,
  GridValueGetterParams,
} from '@material-ui/data-grid';

import gridLocaleTextMap from 'renderer/variables/gridLocaleText';
import { Chip, Divider } from '@material-ui/core';
import { PageResult } from 'renderer/domain/Page';
import { Customer, CustomerTagView } from 'renderer/domain/Customer';
import getPageQuery from 'renderer/domain/graphql/Page';
import CustomerForm, {
  CustomerFormValues,
} from 'renderer/components/Chat/DetailCard/panel/CustomerForm';
import { CustomerExportGridToolbarCreater } from 'renderer/components/Table/CustomerGridToolbar';
import { SearchHit } from 'renderer/domain/Conversation';
import SearchForm from 'renderer/components/SearchForm/SearchForm';
import { PageParam } from 'renderer/domain/graphql/Query';
import {
  CORE_CUSTOMER_FIELDS,
  CustomerQueryInput,
} from 'renderer/domain/graphql/Customer';
import DraggableDialog, {
  DraggableDialogRef,
} from 'renderer/components/DraggableDialog/DraggableDialog';
import useAlert from 'renderer/hook/alert/useAlert';
import { getDownloadS3ChatFilePath } from 'renderer/config/clientConfig';
import javaInstant2DateStr from 'renderer/utils/timeUtils';

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

const MUTATION_CUSTOMER_EXPORT = gql`
  mutation ExportCustomer($customerExportFilter: CustomerExportFilterInput!) {
    exportCustomer(customerExportFilter: $customerExportFilter)
  }
`;
interface MutationExportGraphql {
  exportCustomer: string;
}

const dateFnsUtils = new DateFnsUtils();

const getDefaultValue = () => {
  return {
    keyword: '',
    page: new PageParam(),
    timeRange: {
      from: dateFnsUtils.format(
        dateFnsUtils.startOfMonth(new Date()),
        "yyyy-MM-dd'T'HH:mm:ss.SSSXX"
      ),
      to: dateFnsUtils.format(
        dateFnsUtils.endOfDay(new Date()),
        "yyyy-MM-dd'T'HH:mm:ss.SSSXX"
      ),
    },
  };
};

export default function Crm() {
  const { t, i18n } = useTranslation();

  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [selectCustomer, setSelectCustomer] = useState<
    CustomerFormValues | undefined
  >(undefined);
  const [customerQueryInput, setCustomerQueryInput] =
    useState<CustomerQueryInput>(getDefaultValue());
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const { loading, data, refetch } = useQuery<Graphql>(QUERY, {
    variables: { customerQuery: customerQueryInput },
  });
  const { onLoadding, onCompleted, onError, onErrorMsg } = useAlert();
  const [deleteCustomerByIds, { loading: deleteLoading }] =
    useMutation<unknown>(MUTATION_CUSTOMER, {
      onCompleted,
      onError,
    });
  if (deleteLoading) {
    onLoadding('Deleting');
  }

  const [exportCustomer, { loading: exporting }] =
    useMutation<MutationExportGraphql>(MUTATION_CUSTOMER_EXPORT, {
      onCompleted,
      onError,
    });
  if (exporting) {
    onLoadding('Exporting');
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
    customerQueryInput.page.page = params;
    setAndRefetch(customerQueryInput);
  };

  const handlePageSizeChange = (params: number) => {
    customerQueryInput.page.size = params;
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('CustomerId'), width: 150 },
    { field: 'uid', headerName: t('UID'), width: 150 },
    { field: 'name', headerName: t('Name'), width: 150 },
    {
      field: 'tags',
      headerName: t('Customer Tags'),
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
    { field: 'email', headerName: t('Email'), width: 150 },
    { field: 'mobile', headerName: t('Mobile'), width: 150 },
    { field: 'vipLevel', headerName: t('Vip'), width: 150 },
    { field: 'remarks', headerName: t('Remarks'), width: 150 },
    {
      field: 'createdDate',
      headerName: t('Created Date'),
      width: 180,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value
          ? javaInstant2DateStr(params.value as number)
          : null;
      },
    },
  ];

  return (
    <div style={{ height: 'calc(100vh - 158px)', width: '100%' }}>
      <DraggableDialog title={t('Detailed Customer Info')} ref={refOfDialog}>
        <CustomerForm defaultValues={selectCustomer} shouldDispatch={false} />
      </DraggableDialog>
      <SearchForm
        defaultValues={getDefaultValue()}
        currentValues={customerQueryInput}
        searchAction={setSearchParams}
        selectKeyValueList={[]}
      />
      <Divider variant="inset" component="li" />
      <DataGrid
        localeText={gridLocaleTextMap.get(i18n.language)}
        rows={rows}
        columns={columns}
        components={{
          Toolbar: CustomerExportGridToolbarCreater({
            newButtonClick,
            deleteButtonClick,
            refetch: () => {
              refetch();
            },
            exportToExcel: async () => {
              const exportResult = await exportCustomer({
                variables: {
                  customerExportFilter: _.omit(customerQueryInput, 'page'),
                },
              });
              const filekey = exportResult.data?.exportCustomer;
              if (filekey) {
                const url = `${getDownloadS3ChatFilePath()}${filekey}`;
                window.open(url, '_blank');
              } else {
                onErrorMsg('Export failed');
              }
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
