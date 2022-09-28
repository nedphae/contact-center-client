import { gql, useQuery } from '@apollo/client';
import { Properties } from '../Properties';

interface PropertyGraphql {
  findPropertiesByKey?: Properties;
}

const QUERY_PROPERTY_BY_KEY = gql`
  query property($key: String!) {
    findPropertiesByKey(key: $key) {
      id
      key
      value
      label
      available
      personal
    }
  }
`;

export default function usePropetyByKey(key: string): Properties | undefined {
  const { data } = useQuery<PropertyGraphql>(QUERY_PROPERTY_BY_KEY, {
    variables: { key },
  });
  return data?.findPropertiesByKey;
}
