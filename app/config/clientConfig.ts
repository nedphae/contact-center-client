class ClientConfig {
  web = {
    // gateway 配置地址
    // 后端接口地址，仅修改此地址即可
    host: 'http://localhost:8080',
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
    webSocketLink: 'ws://localhost:8880/subscriptions',
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

  oss = {
    path: '/oss',
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

export function getUploadOssChatImgPath() {
  return `${clientConfig.web.host}${clientConfig.oss.path}/chat/img/${window.orgId}`;
}
export function getUploadOssChatFilePath() {
  return `${clientConfig.web.host}${clientConfig.oss.path}/chat/file/${window.orgId}`;
}
export function getUploadOssStaffImgPath() {
  return `${clientConfig.web.host}${clientConfig.oss.path}/staff/img/${window.orgId}`;
}
export function getDownloadOssChatImgPath() {
  return `${clientConfig.web.host}${clientConfig.oss.path}/chat/img`;
}
export function getDownloadOssChatFilePath() {
  return `${clientConfig.web.host}${clientConfig.oss.path}/chat/file`;
}
export function getDownloadOssStaffImgPath() {
  return `${clientConfig.web.host}${clientConfig.oss.path}/staff/img`;
}

export default clientConfig;
