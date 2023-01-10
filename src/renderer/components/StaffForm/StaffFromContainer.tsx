import { useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';

import Staff from 'renderer/domain/StaffInfo';
import { QUERY_STAFF_BY_ID, StaffGraphql } from 'renderer/domain/graphql/Staff';
import StaffForm from './StaffForm';

interface FormProps {
  staffId: number | undefined;
  mutationCallback?: (staff: Staff) => void | undefined;
}

export default function StaffFormContainer(props: FormProps) {
  const { staffId, mutationCallback } = props;
  const [getStaff, { data }] = useLazyQuery<StaffGraphql>(QUERY_STAFF_BY_ID, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (staffId) {
      getStaff({
        variables: { staffId },
      });
    }
  }, [getStaff, staffId]);

  useEffect(() => {
    if (data?.getStaffById && mutationCallback) {
      mutationCallback(data?.getStaffById);
    }
  }, [data, mutationCallback]);

  const staff = data?.getStaffById;

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
      defaultValues={{ staffType: 0, simultaneousService: 9999 } as Staff}
      mutationCallback={mutationCallback}
    />
  );
}

StaffFormContainer.defaultProps = {
  mutationCallback: undefined,
};
