/* eslint-disable react/jsx-props-no-spreading */
import { useSelector } from 'react-redux';
import { gql, useQuery } from '@apollo/client';

import { getSelectedConstomer } from 'renderer/state/chat/chatAction';
import { Properties } from 'renderer/domain/Properties';

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
