import { useSelector } from 'react-redux';

import { useQuery } from '@apollo/client';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';

import { getSelectedConstomer } from 'renderer/state/chat/chatAction';
import {
  CustomerGraphql,
  QUERY_OFFLINE_CUSTOMER,
} from 'renderer/domain/graphql/Customer';
import { Customer } from 'renderer/domain/Customer';
import CustomerForm from './CustomerForm';

function customerFormWithContainer(user: Customer | undefined) {
  if (user) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <CustomerForm defaultValues={user} shouldDispatch />
      </Container>
    );
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
    </Container>
  );
}

export default function CustomerInfo() {
  const user = useSelector(getSelectedConstomer);
  return customerFormWithContainer(user);
}

interface LazyCustomerInfoProps {
  userId: number;
}

export function LazyCustomerInfo(props: LazyCustomerInfoProps) {
  const { userId } = props;
  const { data } = useQuery<CustomerGraphql>(QUERY_OFFLINE_CUSTOMER, {
    variables: { userId },
  });
  return customerFormWithContainer(data?.getCustomer);
}
