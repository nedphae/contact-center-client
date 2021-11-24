/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useSelector } from 'react-redux';
import { gql, useQuery } from '@apollo/client';

import { getSelectedConstomer } from 'app/state/chat/chatAction';
import { Properties } from 'app/domain/Properties';

const QUERY = gql`
  query Properties {
    findPropertiesByKey(key: "sys.erp.url") {
      id
      label
      available
      value
    }
  }
`;
interface Graphql {
  findPropertiesByKey: Properties;
}

export default function Erp() {
  const user = useSelector(getSelectedConstomer);
  const { data } = useQuery<Graphql>(QUERY);

  const urlProperties = data?.findPropertiesByKey;

  return (
    <>
      {user && urlProperties && (
        <iframe
          title="ERP"
          width="100%"
          height="100%"
          // eslint-disable-next-line no-template-curly-in-string
          src={urlProperties.value?.replace('${uid}', user.uid)}
        />
      )}
    </>
  );
}
