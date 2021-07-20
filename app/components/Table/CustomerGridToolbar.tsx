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
  const { newButtonClick } = props;

  return (
    <GridToolbarContainer>
      <GridToolbarDataButton newButtonClick={newButtonClick} />
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
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <CustomerGridToolbar {...props} />;
  };
  return MyCustomerGridToolbar;
}
