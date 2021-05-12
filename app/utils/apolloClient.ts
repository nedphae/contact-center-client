import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import clientConfig from 'app/config/clientConfig';

import { getAccessToken, refreshToken } from 'app/electron/jwtStorage';

const httpLink = createHttpLink({
  uri: clientConfig.web.host + clientConfig.graphql.graphql,
});
const authLink = setContext(async (_, { headers }) => {
  // do something before request is sent
  let acessToken;
  // TODO: 性能可能又问题，需要修改为异步更新
  try {
    acessToken = (await getAccessToken()).source;
  } catch {
    acessToken = (await refreshToken()).source;
  }
  // get the authentication token from local storage if it exists
  // return the headers to the context so httpLink can read them
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
