import { gql, useQuery } from '@apollo/client';
import { Properties } from '../Properties';

interface PropertyGraphql {
  findPersonPropertiesByKey?: Properties;
}

const QUERY_PROPERTY_BY_KEY = gql`
  query property($key: String!) {
    findPersonPropertiesByKey(key: $key) {
      id
      key
      value
      label
      available
      personal
    }
  }
`;

export default function usePropetyByKey(key: string) {
  const { data, refetch } = useQuery<PropertyGraphql>(QUERY_PROPERTY_BY_KEY, {
    variables: { key },
  });
  return { prop: data?.findPersonPropertiesByKey, refetch };
}
