import React from 'react';

import { useSelector } from 'react-redux';

import { getMyself } from 'app/state/staff/staffAction';
import StaffForm from 'app/components/StaffForm/StaffForm';

export default function Account() {
  const mySelf = useSelector(getMyself);

  return <StaffForm defaultValues={mySelf} />;
}
