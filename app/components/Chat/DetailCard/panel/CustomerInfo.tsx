import React from 'react';
import { useSelector } from 'react-redux';

import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';

import { getSelectedConstomer } from 'app/state/chat/chatAction';
import CustomerForm from './CustomerForm';

export default function CustomerInfo() {
  const user = useSelector(getSelectedConstomer);

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
