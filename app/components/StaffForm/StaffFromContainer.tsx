import React, { useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

import Staff from 'app/domain/StaffInfo';
import StaffForm from './StaffForm';

interface FormProps {
  staffId: number | undefined;
  mutationCallback?: (staff: Staff) => void | undefined;
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
  const { staffId, mutationCallback } = props;
  const [getStaff, { data }] = useLazyQuery<Graphql>(QUERY_STAFF);

  useEffect(() => {
    if (staffId) {
      getStaff({
        variables: { staffId },
      });
    }
  }, [getStaff, staffId]);

  const staff = data?.getStaffById;
  if (staff) {
    if (mutationCallback) {
      mutationCallback(staff);
    }
  }
  if (staffId) {
    return (
      <>
        {staff && (
          <StaffForm
            defaultValues={staff}
            mutationCallback={mutationCallback}
          />
        )}
      </>
    );
  }
  return (
    <StaffForm
      defaultValues={{ staffType: 0 } as Staff}
      mutationCallback={mutationCallback}
    />
  );
}

StaffFormContainer.defaultProps = {
  mutationCallback: undefined,
};
