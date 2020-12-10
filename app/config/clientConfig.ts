export default {
  web: {
    host: 'http://localhost:8000',
  },
  // jwt 配置
  oauth: {
    jwks: '/.well-known/jwks.json',
    oauthPath: '/oauth/token',
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
};
