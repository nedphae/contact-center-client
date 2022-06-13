import { useState, useEffect, useRef } from 'react';

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

import clientConfig from 'renderer/config/clientConfig';

import { getTokenSource } from 'renderer/electron/jwtStorage';
import { SubscriptionClient } from 'subscriptions-transport-ws';

export default function useApolloClient(): [
  ApolloClient<NormalizedCacheObject> | undefined
] {
  const [graphqlClient, setGraphqlClient] =
    useState<ApolloClient<NormalizedCacheObject>>();

  const subscriptionClient = useRef<SubscriptionClient>();

  useEffect(() => {
    subscriptionClient.current = new SubscriptionClient(
      clientConfig.graphql.webSocketLink,
      {
        reconnect: true,
        connectionParams: async () => {
          const acessToken = await getTokenSource();
          return {
            Authorization: acessToken ? `Bearer ${acessToken}` : '',
          };
        },
      }
    );
  }, [subscriptionClient]);

  useEffect(() => {
    if (!graphqlClient && subscriptionClient.current) {
      const wsLink = new WebSocketLink(subscriptionClient.current);

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

      setGraphqlClient(apolloClient);
    }
  }, [graphqlClient]);

  useEffect(() => {
    return () => {
      if (graphqlClient) {
        graphqlClient.stop();
        setGraphqlClient(undefined);
      }
      if (subscriptionClient.current) {
        subscriptionClient.current.close();
        subscriptionClient.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [graphqlClient];
}
