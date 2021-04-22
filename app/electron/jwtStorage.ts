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
 * @returns 验证并保存过的 acess token
 */
export function saveToken(token: OauthToken): Promise<AccessToken> {
  return new Promise<AccessToken>((resolve, reject) => {
    verifyToken(token.access_token, (err: unknown, decoded: unknown) => {
      if (decoded) {
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

export function getToken(): Promise<OauthToken> {
  return new Promise((resolve, reject) => {
    // 把 token 保存到 localStorage
    const token = localStorage.getItem(clientConfig.oauth.tokenName);
    if (token) {
      resolve(JSON.parse(token) as OauthToken);
    }
    storage.get(clientConfig.oauth.tokenName, (error, data) => {
      if (error) {
        // 没有获取到 OauthToken 也要清除权限
        localStorage.removeItem('antd-pro-authority');
        reject(error);
      }
      localStorage.setItem(clientConfig.oauth.tokenName, JSON.stringify(data));
      resolve(data as OauthToken);
    });
  });
}

export function clearToken() {
  localStorage.removeItem(clientConfig.oauth.tokenName);
  storage.remove(clientConfig.oauth.tokenName, (error) => {
    throw error;
  });
}

export async function refreshToken(): Promise<AccessToken> {
  const { refresh_token, oid } = await getToken();
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
  return saveToken(result.data);
}
