import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

import clientConfig from 'app/config/clientConfig';

import { getTokenSource } from 'app/electron/jwtStorage';

const wsLink = new WebSocketLink({
  uri: clientConfig.graphql.webSocketLink,
  options: {
    reconnect: true,
    connectionParams: async () => {
      const acessToken = await getTokenSource();
      return {
        Authorization: acessToken ? `Bearer ${acessToken}` : '',
      };
    },
  },
});

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

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default apolloClient;
