class ClientConfig {
  web = {
    // gateway 配置地址
    // 后端接口地址，仅修改此地址即可
    host:
      process.env.NODE_ENV === 'production'
        ? 'https://im.xbcs.top'
        : 'http://localhost:8080',
  };

  // jwt 配置
  oauth = {
    jwks: '/.well-known/jwks.json',
    path: '/oauth/token',
    clientId: 'Xsrr8fXfGJ',
    clientSecret: 'K&wroZ4M6z4@a!W62q$*Dks',
    grant_type: 'password',
    scope: 'staff',
    // json-storage 存储名称
    tokenName: 'jwt.token',
    // localStorage 存储名称
    accessTokenName: 'jwt.access_token',
  };

  // clientId 配置
  headers = {
    Authorization: `Basic ${btoa(
      `${this.oauth.clientId}:${this.oauth.clientSecret}`
    )}`,
  };

  graphql = {
    // webSocket 不在使用
    webSocketLink:
      process.env.NODE_ENV === 'production'
        ? 'wss://im.xbcs.top/subscriptions'
        : 'ws://localhost:8880/subscriptions',
    graphql: '/graphql',
  };

  websocket = {
    path: '/socket.io',
    namespace: '/im/staff',
  };

  im = {
    path: '/im',
  };

  bot = {
    path: '/bot',
  };

  customer = {
    path: '/customer',
  };

  dispatcher = {
    path: '/dispatcher',
  };

  s3 = {
    path: '/s3',
  };

  message = {
    path: '/message',
  };

  status = {
    path: '/status',
  };

  staff = {
    path: '/staff',
  };
}
const clientConfig = new ClientConfig();

export function getUploadS3ChatImgPath() {
  return `${clientConfig.web.host}${clientConfig.s3.path}/chat/img/${window.orgId}`;
}
export function getUploadS3ChatFilePath() {
  return `${clientConfig.web.host}${clientConfig.s3.path}/chat/file/${window.orgId}`;
}
export function getUploadS3StaffImgPath() {
  return `${clientConfig.web.host}${clientConfig.s3.path}/staff/img/${window.orgId}`;
}
export function getDownloadS3ChatImgPath() {
  return `${clientConfig.web.host}`;
}
export function getDownloadS3ChatFilePath() {
  return `${clientConfig.web.host}`;
}
export function getDownloadS3StaffImgPath() {
  return `${clientConfig.web.host}`;
}

export default clientConfig;
