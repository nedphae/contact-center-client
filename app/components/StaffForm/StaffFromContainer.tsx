import React, { useMemo, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

import Staff from 'app/domain/StaffInfo';
import StaffForm from './StaffForm';

interface FormProps {
  staffId: number | null | undefined;
}

interface Graphql {
  getStaffById: Staff;
}

const QUERY_STAFF = gql`
  query Staff($staffId: Long!) {
    getStaffById(staffId: $staffId) {
      id
      organizationId
      username
      role
      staffGroupId
      realName
      nickName
      avatar
      simultaneousService
      maxTicketPerDay
      maxTicketAllTime
      staffType
      gender
      mobilePhone
      personalizedSignature
      enabled
    }
  }
`;

export default function StaffFormContainer(props: FormProps) {
  const { staffId } = props;
  const [getStaff, { data }] = useLazyQuery<Graphql>(QUERY_STAFF, {
    variables: { staffId },
  });

  useEffect(() => {
    if (staffId) {
      getStaff();
    }
  });

  const staff = useMemo(() => {
    if (data) {
      return data.getStaffById;
    }
    return { staffType: 0 } as Staff;
  }, [data]);

  return <StaffForm defaultValues={staff} />;
}
