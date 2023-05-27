class ClientConfig {
  web = {
    // gateway 配置地址
    // 后端接口地址，仅修改此地址即可
    host:
      process.env.NODE_ENV === 'production'
        ? 'https://im.xbcs.top'
        : 'http://localhost:8080',
  };

  kibanaBae = {
    baseUrl:
      process.env.NODE_ENV === 'production'
        ? 'https:/kibana.xbcs.top:5600'
        : 'http://localhost:5600',
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
  };

  // clientId 配置
  headers = {
    Authorization: `Basic ${window.btoa(
      `${this.oauth.clientId}:${this.oauth.clientSecret}`
    )}`,
  };

  graphql = {
    // webSocket 不再使用
    webSocketLink: `${this.web.host}/subscriptions`,
    graphql: '/hasura/v1/graphql',
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

  kibana = {
    loginUrl: `${this.kibanaBae.baseUrl}/auto-login`,
    spaceUrl: `${this.kibanaBae.baseUrl}/api/spaces/space/$spaceId`,
    logoutUrl: `${this.kibanaBae.baseUrl}/logout`,
    dashboardUrl:
      `${this.kibanaBae.baseUrl}/s/$spaceId/app/dashboards#/view/$dashboardId?embed=true&` +
      '_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2C' +
      'time%3A(from%3Anow%2Fd%2Cto%3Anow%2Fd))' +
      '&show-query-input=true&show-time-filter=true',
  };
}
const clientConfig = new ClientConfig();

// export function getUploadS3ChatPath() {
//   return `${clientConfig.web.host}${clientConfig.s3.path}/chat/${window.orgId}`;
// }
export function getUploadS3ChatPath() {
  return `${clientConfig.web.host}${clientConfig.s3.path}/chat/${window.orgId}`;
}
export function getUploadS3StaffPath() {
  return `${clientConfig.web.host}${clientConfig.s3.path}/staff/${window.orgId}`;
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

export function getDashboardUrlById(spaceId: string, dashboardId: string) {
  return clientConfig.kibana.dashboardUrl
    .replace('$dashboardId', dashboardId)
    .replace('$spaceId', spaceId);
}

export function getKibanaSpaceUrl(spaceId: string) {
  return clientConfig.kibana.spaceUrl.replace('$spaceId', spaceId);
}

export default clientConfig;
