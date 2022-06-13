import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import clientConfig from 'renderer/config/clientConfig';

import { getTokenSource } from 'renderer/electron/jwtStorage';

const httpLink = createHttpLink({
  uri: clientConfig.web.host + clientConfig.graphql.graphql,
});

const authLink = setContext(async (_, { headers }) => {
  const acessToken = await getTokenSource();
  return {
    headers: {
      ...headers,
      authorization: acessToken ? `Bearer ${acessToken}` : '',
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default apolloClient;
