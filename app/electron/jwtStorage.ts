import os from 'os';
import storage from 'electron-json-storage';
import axios from 'axios';
import verifyToken from 'app/utils/jwtUtils';
import { OauthToken, AccessToken } from 'app/domain/OauthToken';
import clientConfig from 'app/config/clientConfig';
import addParam from 'app/utils/url';

storage.setDataPath(os.tmpdir());

/**
 * 保存 token 并做基本的验证
 * @param token 要保存的 jwt token
 * @param save 是否保存，否就保存至 sessionStorage
 * @returns 验证并保存过的 acess token
 */
export function saveToken(
  token: OauthToken,
  save: boolean
): Promise<AccessToken> {
  return new Promise<AccessToken>((resolve, reject) => {
    verifyToken(token.access_token, (err: unknown, decoded: unknown) => {
      if (decoded) {
        if (save) {
          // storage 保存整个 jwt， localStorage 保存 access_token
          localStorage.setItem(
            clientConfig.oauth.tokenName,
            JSON.stringify(token)
          );
          storage.set(clientConfig.oauth.tokenName, token, (error) => {
            if (error) {
              reject(err);
            }
          });
        } else {
          // 保存到 sessionStorage
          sessionStorage.setItem(
            clientConfig.oauth.tokenName,
            JSON.stringify(token)
          );
        }
        const accessToken = decoded as AccessToken;
        accessToken.source = token.access_token;
        return resolve(accessToken);
      }
      // 验证失败就删除 权限
      localStorage.removeItem('antd-pro-authority');
      return reject(err);
    });
  });
}

function getToken(isAccese = true): Promise<OauthToken | AccessToken> {
  return new Promise((resolve, reject) => {
    function verifyTokenResolve(token: OauthToken) {
      const shoudVerifyToken = isAccese
        ? token.access_token
        : token.refresh_token;
      verifyToken(shoudVerifyToken, (err: unknown, decoded: unknown) => {
        if (decoded) {
          if (isAccese) {
            const accessToken = decoded as AccessToken;
            accessToken.source = token.access_token;
            return resolve(accessToken);
          }
          return resolve(token);
        }
        return reject(err);
      });
    }

    // 把 token 保存到 sessionStorage
    let token = sessionStorage.getItem(clientConfig.oauth.tokenName);
    if (token) {
      verifyTokenResolve(JSON.parse(token) as OauthToken);
    } else {
      // 把 token 保存到 localStorage
      token = localStorage.getItem(clientConfig.oauth.tokenName);
      if (token) {
        verifyTokenResolve(JSON.parse(token) as OauthToken);
      } else {
        storage.get(clientConfig.oauth.tokenName, (error, data) => {
          if (error) {
            // 没有获取到 OauthToken 也要清除权限
            localStorage.removeItem('antd-pro-authority');
            return reject(error);
          }
          localStorage.setItem(
            clientConfig.oauth.tokenName,
            JSON.stringify(data)
          );
          return verifyTokenResolve(data as OauthToken);
        });
      }
    }
  });
}

/**
 * 标记类型检查
 */
function isOauthToken(token: OauthToken | AccessToken): token is OauthToken {
  return (<OauthToken>token).access_token !== undefined;
}

export async function getAccessToken(): Promise<AccessToken> {
  const token = await getToken();
  if (!isOauthToken(token)) {
    return token;
  }
  // 仅仅取消类型检查
  return {} as AccessToken;
}

export async function getOauthToken(): Promise<OauthToken> {
  const token = await getToken(false);
  if (isOauthToken(token)) {
    return token;
  }
  return {} as OauthToken;
}

export function clearToken() {
  localStorage.removeItem('antd-pro-authority');
  sessionStorage.removeItem(clientConfig.oauth.tokenName);
  localStorage.removeItem(clientConfig.oauth.tokenName);
  storage.remove(clientConfig.oauth.tokenName, (error) => {
    throw error;
  });
}

export async function refreshToken(): Promise<AccessToken> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { refresh_token, oid } = await getOauthToken();
  const oauthParam = {
    grant_type: 'refresh_token',
    refresh_token,
    org_id: oid,
  };
  const url = addParam(
    clientConfig.web.host + clientConfig.oauth.path,
    oauthParam
  );
  const result = await axios.post<OauthToken>(url, null, {
    headers: {
      Authorization: clientConfig.headers.Authorization,
    },
  });
  return saveToken(
    result.data,
    sessionStorage.getItem(clientConfig.oauth.tokenName) === null
  );
}
