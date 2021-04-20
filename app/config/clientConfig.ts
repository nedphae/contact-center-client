export default {
  web: {
    host: 'http://localhost:8700',
  },
  // jwt 配置
  oauth: {
    jwks: '/.well-known/jwks.json',
    path: '/oauth/token',
    clientId: 'user_client',
    clientSecret: 'test_secret',
    grant_type: 'password',
    scope: 'staff',
    // json-storage 存储名称
    tokenName: 'jwt.token',
    // localStorage 存储名称
    accessTokenName: 'jwt.access_token',
  },
  // clientId 配置
  headers: {
    Authorization: 'Basic dXNlcl9jbGllbnQ6dGVzdF9zZWNyZXQ=',
  },
  websocket: {
    path: '/socket.io',
  },
  im: {
    path: '/im',
  },
  bot: {
    path: '/bot',
  },
  customer: {
    path: '/customer',
  },
  dispatcher: {
    path: '/dispatcher',
  },
  oss: {
    path: '/oss',
  },
  message: {
    path: '/message',
  },
  status: {
    path: '/status',
  },
  staff: {
    path: '/staff',
  },
};
