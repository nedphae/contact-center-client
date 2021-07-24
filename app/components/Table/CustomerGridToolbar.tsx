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

export type CustomerGridToolbarProps = GridToolbarDataProps;

export default function CustomerGridToolbar(props: CustomerGridToolbarProps) {
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
