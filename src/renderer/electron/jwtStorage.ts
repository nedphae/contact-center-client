import _ from 'lodash';
import axios from 'axios';
import verifyToken from 'renderer/utils/jwtUtils';
import { OauthToken, AccessToken } from 'renderer/domain/OauthToken';
import clientConfig from 'renderer/config/clientConfig';
import addParam from 'renderer/utils/url';
import { OnlineStatus } from 'renderer/domain/constant/Staff';

/**
 * 删除所有cookie
 * 当前只有 kibana cookie
 */
export default async function deleteAllCookies() {
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.sendMessage('clear-all-cookies');
  } else {
    // 调用登出接口
    await axios.get<void>(clientConfig.kibana.logoutUrl);
  }
}

/**
 * 保存 token 并做基本的验证
 * @param token 要保存的 jwt token
 * @param save 是否保存，否就保存至 sessionStorage
 * @returns 验证并保存过的 acess token
 */
export async function saveToken(
  token: OauthToken,
  save: boolean
): Promise<AccessToken> {
  const decoded = await verifyToken(token.access_token);
  if (decoded) {
    const accessToken = decoded;
    accessToken.source = token.access_token;
    if (save) {
      // storage 保存整个 jwt
      localStorage.setItem(clientConfig.oauth.tokenName, JSON.stringify(token));
    } else {
      // 保存到 sessionStorage
      sessionStorage.setItem(
        clientConfig.oauth.tokenName,
        JSON.stringify(token),
      );
    }
    return Promise.resolve(accessToken);
  }
  // 验证失败就删除 权限
  localStorage.removeItem('antd-pro-authority');

  return decoded;
}

async function getToken(
  isAccese = true
): Promise<OauthToken | AccessToken | undefined> {
  async function verifyTokenResolve(
    token: OauthToken,
  ): Promise<OauthToken | AccessToken | undefined> {
    if (!_.isEmpty(token)) {
      const shoudVerifyToken = isAccese
        ? token.access_token
        : token.refresh_token;
      const decoded = await verifyToken(shoudVerifyToken);
      if (decoded) {
        if (isAccese) {
          const accessToken = decoded as AccessToken;
          accessToken.source = token.access_token;
          return accessToken;
        }
        return token;
      }
      return undefined;
    }
    return undefined;
  }

  // 把 token 保存到 sessionStorage
  let token = sessionStorage.getItem(clientConfig.oauth.tokenName);
  if (token) {
    return verifyTokenResolve(JSON.parse(token) as OauthToken);
  }
  // 把 token 保存到 localStorage
  token = localStorage.getItem(clientConfig.oauth.tokenName);
  if (token) {
    return verifyTokenResolve(JSON.parse(token) as OauthToken);
  }
  return undefined;
}

/**
 * 标记类型检查
 */
function isOauthToken(token: OauthToken | AccessToken): token is OauthToken {
  return (<OauthToken>token)?.access_token !== undefined;
}

export async function getAccessToken(): Promise<AccessToken | undefined> {
  const token = await getToken();
  if (token && !isOauthToken(token)) {
    return token;
  }
  return undefined;
}

export async function getOauthToken(): Promise<OauthToken | undefined> {
  const token = await getToken(false);
  if (token && isOauthToken(token)) {
    return token;
  }
  return undefined;
}

export function clearToken() {
  localStorage.removeItem('antd-pro-authority');
  localStorage.removeItem('onlineStatus');
  sessionStorage.removeItem(clientConfig.oauth.tokenName);
  localStorage.removeItem(clientConfig.oauth.tokenName);
  deleteAllCookies();
}

export async function refreshToken(): Promise<AccessToken | undefined> {
  const oauthToken = await getOauthToken();
  if (oauthToken) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { refresh_token, oid } = oauthToken;
    const oauthParam = {
      grant_type: 'refresh_token',
      refresh_token,
      org_id: oid,
    };
    const url = addParam(
      clientConfig.web.host + clientConfig.oauth.path,
      oauthParam,
    );
    const result = await axios.post<OauthToken>(url, undefined, {
      headers: {
        Authorization: clientConfig.headers.Authorization,
      },
    });
    if (result.data) {
      return saveToken(
        result.data,
        sessionStorage.getItem(clientConfig.oauth.tokenName) === undefined,
      );
    }
  }
  return undefined;
}

export async function getTokenSource(): Promise<string | undefined> {
  let acessToken;
  try {
    acessToken = (await getAccessToken())?.source;
  } catch {
    acessToken = (await refreshToken())?.source;
  }
  return acessToken;
}

export function saveOnlineStatus(onlineStatus: OnlineStatus) {
  localStorage.setItem('onlineStatus', onlineStatus.toString());
}

export function getOnlineStatus() {
  return localStorage.getItem('onlineStatus');
}
