/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from '@material-ui/data-grid';
import {
  GridToolbarDataButton,
  GridToolbarDataProps,
} from './GridToolbarDataButton';
import { GridToolbarExportButton } from './GridToolbarExportButton';

export type CustomerGridToolbarProps = GridToolbarDataProps;

export function CustomerGridToolbar(props: CustomerGridToolbarProps) {
  return (
    <GridToolbarContainer>
      <GridToolbarDataButton {...props} />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}
// Function Higher-Order Components HOC
export function CustomerGridToolbarCreater(props: CustomerGridToolbarProps) {
  const MyCustomerGridToolbar: React.FunctionComponent = () => {
    return <CustomerGridToolbar {...props} />;
  };
  return MyCustomerGridToolbar;
}

export interface CustomerExportGridToolbarProps extends GridToolbarDataProps {
  exportToExcel: () => void;
  exportText?: string;
}

export function CustomerExportGridToolbar(
  props: CustomerExportGridToolbarProps
) {
  const { exportToExcel, exportText, ...dataProps } = props;
  return (
    <GridToolbarContainer>
      <GridToolbarDataButton {...dataProps} />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExportButton
        exportToExcel={exportToExcel}
        exportText={exportText ?? '导出至Excel(链接一天内有效)'}
      />
    </GridToolbarContainer>
  );
}

export function CustomerExportGridToolbarCreater(
  props: CustomerExportGridToolbarProps
) {
  const MyCustomerGridToolbar: React.FunctionComponent = () => {
    return <CustomerExportGridToolbar {...props} />;
  };
  return MyCustomerGridToolbar;
}

CustomerExportGridToolbarCreater.defaultProps = {
  exportText: '导出至Excel(链接一天内有效)',
};

CustomerExportGridToolbar.defaultProps = {
  exportText: '导出至Excel(链接一天内有效)',
};
