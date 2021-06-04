import React from 'react';
import { useSelector } from 'react-redux';

import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';

import { getSelectedConstomer } from 'app/state/session/sessionAction';
import CustomerForm from './CustomerForm';

export default function CustomerInfo() {
  const user = useSelector(getSelectedConstomer);

  if (user) {
    const defaultValues = {
      id: user.userId,
      organizationId: user.organizationId,
      uid: user.uid,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      vipLevel: user.vipLevel,
      detailData: user.detailData,
    };
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <CustomerForm defaultValues={defaultValues} />
      </Container>
    );
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
    </Container>
  );
}
