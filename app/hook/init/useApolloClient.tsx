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

import clientConfig from 'app/config/clientConfig';

import { getTokenSource } from 'app/electron/jwtStorage';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { Message } from 'app/domain/Message';

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
        cache: new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                loadHistoryMessage: {
                  // read(existing?: Message[], { args: { offset, limit } }) {
                  //   // A read function should always return undefined if existing is
                  //   // undefined. Returning undefined signals that the field is
                  //   // missing from the cache, which instructs Apollo Client to
                  //   // fetch its value from your GraphQL server.
                  //   const filterList = existing?.filter(
                  //     (it) => (it.seqId ?? 0) < (offset ?? 0)
                  //   );
                  //   return filterList && filterList.slice(0, limit);
                  // },
                  // Don't cache separate results based on
                  // any of this field's arguments.
                  keyArgs: false,
                  // Concatenate the incoming list items with
                  // the existing list items.
                  merge(existing = [], incoming) {
                    return [...existing, ...incoming];
                  },
                },
              },
            },
          },
        }),
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
