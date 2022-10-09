import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import clientConfig from 'renderer/config/clientConfig';

import { getTokenSource } from 'renderer/electron/jwtStorage';

const httpLink = createHttpLink({
  uri: clientConfig.web.host + clientConfig.graphql.graphql,
});

const authLink = setContext(async (_, { headers }) => {
  const accessToken = await getTokenSource();
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default apolloClient;
