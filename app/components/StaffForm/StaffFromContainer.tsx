import React, { useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';

import Staff from 'app/domain/StaffInfo';
import { QUERY_STAFF_BY_ID, StaffGraphql } from 'app/domain/graphql/Staff';
import StaffForm from './StaffForm';

interface FormProps {
  staffId: number | undefined;
  mutationCallback?: (staff: Staff) => void | undefined;
}

export default function StaffFormContainer(props: FormProps) {
  const { staffId, mutationCallback } = props;
  const [getStaff, { data }] = useLazyQuery<StaffGraphql>(QUERY_STAFF_BY_ID);

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
